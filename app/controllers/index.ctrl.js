'use strict';
let express = require('express');
let router = express.Router({caseSensitive: true});
let helper = rootRequire('app/models/util/util');
let _ = require('lodash');
let resource = rootRequire('app/controllers/resource/key/resourceKey');
let auth = require('./auth/auth.service');
// let acceptLanguageParser = require('accept-language-parser');
// let availableLanguagesForHomePage = ['en', 'ar', 'zh', 'fr', 'ru', 'es', 'pt'];

module.exports = function(app) {
    app.use('/', router);
};

/* router.get('/', function(req, res, next) {
    let isPreview = typeof(req.query._preview) !== 'undefined';
    if (isPreview) {
        auth.setNoCache(res);
    }
    if (typeof req.query.q !== 'undefined') {
        // if using the short omni search format gbif.org?q=something then redirect to search
        res.redirect(302, res.locals.gb.locales.urlPrefix + '/search?q=' + req.query.q);
    } else {
        // if no language defined in url, then select language for home page content based on accept language in header
        // let matchedLanguage = acceptLanguageParser.pick(availableLanguagesForHomePage, req.headers['accept-language']);
        // let homePageLanguage = !res.locals.gb.locales.urlPrefix ? matchedLanguage : res.locals.gb.locales.current;
        let homePageLanguage = res.locals.gb.locales.current;

        // TODO shouldn't events be visible on the home page ? they are all hidden per default
        resource.getHomePage(isPreview, homePageLanguage).then(function(homepage) {
                let context = {
                    main: homepage.main,
                    resolved: homepage.resolved,
                    _meta: {
                        title: 'GBIF',
                        bodyClass: 'hasTransparentMenu',
                        hideSearchAction: true
                    }
                };
                // res.json(context); return;
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
}); */
