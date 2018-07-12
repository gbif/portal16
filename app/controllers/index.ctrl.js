'use strict';
let express = require('express');
let router = express.Router();
let helper = rootRequire('app/models/util/util');
let _ = require('lodash');
let resource = rootRequire('app/controllers/resource/key/resourceKey');
let resourceSearch = rootRequire('app/controllers/api/resource/search/resourceSearch');
let acceptLanguageParser = require('accept-language-parser');
let auth = require('./auth/auth.service');
let availableLanguagesForHomePage = ['en', 'zh', 'fr', 'ru', 'es', 'pt'];


module.exports = function(app) {
    app.use('/', router);
};

router.get('/', function(req, res, next) {
    let isPreview = typeof(req.query._preview) !== 'undefined';
    if (isPreview) {
        auth.setNoCache(res);
    }
    if (typeof req.query.q !== 'undefined') {
        // if using the short omni search format gbif.org?q=something then redirect to search
        res.redirect(302, res.locals.gb.locales.urlPrefix + '/search?q=' + req.query.q);
    } else {
        // if no language defined in url, then select language for home page content based on accept language in header
        let matchedLanguage = acceptLanguageParser.pick(availableLanguagesForHomePage, req.headers['accept-language']);
        let homePageLanguage = !res.locals.gb.locales.urlPrefix ? matchedLanguage : res.locals.gb.locales.current;
        let news = resourceSearch.search({contentType: 'news', limit: 1, homepage: true, locale: homePageLanguage}, req.__, 5000);
        let dataUse = resourceSearch.search({contentType: 'dataUse', limit: 1, homepage: true, locale: homePageLanguage}, req.__, 5000);
        let event = resourceSearch.search({contentType: 'event', limit: 1, homepage: true, locale: homePageLanguage}, req.__, 5000);

        // TODO shouldn't events be visible on the home page ? they are all hidden per default
        let homepage = resource.getHomePage(isPreview, homePageLanguage);

        Promise.all([homepage, news, dataUse, event])
            .then(function(values) {
                let highlights = [];
                highlights.push(_.get(values[1], 'results[0]'));
                highlights.push(_.get(values[2], 'results[0]'));
                if (_.has(values[3], 'results[0]')) highlights.push(_.get(values[3], 'results[0]'));

                _.get(values[0], 'main.fields.features', []).forEach(function(e) {
                    let featureItem = _.get(values[0], 'resolved.Entry.' + _.get(e, 'sys.id'));
                    if (featureItem) {
                        featureItem.fields.contentType = _.get(featureItem, 'sys.contentType.sys.id');
                        featureItem.fields.id = _.get(featureItem, 'sys.id');
                        featureItem.fields.primaryImage = _.get(values[0], 'resolved.Asset.' + _.get(featureItem, 'fields.primaryImage.sys.id') + '.fields');
                        featureItem = featureItem.fields;
                        highlights.push(featureItem);
                    }
                });
                values[0].highlights = highlights;

                // let img = chance.pick(featureItem.fields.primaryImage);
                // featureItem.fields.primaryImage = _.get(values[0], 'resolved.Entry.' + _.get(img, 'sys.id'));
                let context = {
                    main: values[0].main,
                    resolved: values[0].resolved,
                    highlights: highlights,
                    _meta: {
                        title: 'GBIF',
                        bodyClass: 'hasTransparentMenu',
                        hideSearchAction: true
                    }
                };
                // res.json(context);
                // return;
                helper.renderPage(req, res, next, context, 'pages/home/home');
            })
            .catch(function() {
                // TODO log error
                // show page without highlight stories
                res.setHeader('Cache-Control', 'no-cache'); // TODO might be worth having a short cache on it
                helper.renderPage(req, res, next, {
                    _meta: {
                        title: 'GBIF',
                        bodyClass: 'hasTransparentMenu'
                    }
                }, 'pages/home/home');
            });
    }
});
