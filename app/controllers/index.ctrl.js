"use strict";
let express = require('express'),
    router = express.Router(),
    helper = rootRequire('app/models/util/util'),
    _ = require('lodash'),
    resource = rootRequire('app/controllers/resource/key/resourceKey'),
    resourceSearch = rootRequire('app/controllers/api/resource/search/resourceSearch');


module.exports = function (app) {
    app.use('/', router);
};

router.get('/', function (req, res, next) {
    if (typeof req.query.q !== 'undefined') {
        //if using the short omni search format gbif.org?q=something then redirect to search
        res.redirect(302, res.locals.gb.locales.urlPrefix + '/search?q=' + req.query.q);
    } else {
        let news = resourceSearch.search({contentType: 'news', limit: 1, homepage: true}, req.__, 5000),
            dataUse = resourceSearch.search({contentType: 'dataUse', limit: 1, homepage: true}, req.__, 5000),
            event = resourceSearch.search({contentType: 'event', limit: 1, homepage: true}, req.__, 5000), //TODO shouldn't events be visible on the home page ? they are all hidden per default
            homepage = resource.getHomePage({content_type: 'homePage'}, 3, false, res.locals.gb.locales.current);

        Promise.all([homepage, news, dataUse, event])
            .then(function (values) {
                let highlights = [];
                _.get(values[0], 'main.fields.features', []).forEach(function (e) {
                    let featureItem = _.get(values[0], 'resolved.Entry.' + _.get(e, 'sys.id'));
                    if (featureItem) {
                        featureItem.fields.contentType = _.get(featureItem, 'sys.contentType.sys.id');
                        featureItem.fields.id = _.get(featureItem, 'sys.id');
                        featureItem.fields.primaryImage = _.get(values[0], 'resolved.Asset.' + _.get(featureItem, 'fields.primaryImage.sys.id') + '.fields');
                        featureItem = featureItem.fields;
                        highlights.push(featureItem);
                    }
                });
                highlights.push(_.get(values[1], 'results[0]'));
                highlights.push(_.get(values[2], 'results[0]'));
                highlights.push(_.get(values[3], 'results[0]'));
                values[0].highlights = highlights;


                //let img = chance.pick(featureItem.fields.primaryImage);
                //featureItem.fields.primaryImage = _.get(values[0], 'resolved.Entry.' + _.get(img, 'sys.id'));
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
                //res.json(context);
                //return;
                helper.renderPage(req, res, next, context, 'pages/home/home');
            })
            .catch(function (err) {
                //show page without highlight stories
                res.setHeader('Cache-Control', 'no-cache'); //TODO might be worth having a short cache on it
                helper.renderPage(req, res, next, {
                    _meta: {
                        title: 'GBIF',
                        bodyClass: 'hasTransparentMenu',
                        hideSearchAction: true
                    }
                }, 'pages/home/home');
            });
    }
});

