"use strict";
let express = require('express'),
    router = express.Router(),
    helper = rootRequire('app/models/util/util'),
    _ = require('lodash'),
    resourceSearch = rootRequire('app/controllers/api/resource/search/resourceSearch');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/', function (req, res, next) {
    if (typeof req.query.q !== 'undefined') {
        //if using the short omni search format gbif.org?q=something then redirect to search
        res.redirect(302, res.locals.gb.locales.urlPrefix + '/search?q=' + req.query.q);
    } else {
        let news = resourceSearch.search({contentType:'news',limit:1, homepage: true}, req.__, 5000),
            dataUse = resourceSearch.search({contentType:'dataUse',limit:1, homepage: true}, req.__, 5000),
            event = resourceSearch.search({contentType:'event',limit:1, homepage: false}, req.__, 5000), //TODO shouldn't events be visible on the home page ? they are all hidden per default
            feature = resourceSearch.search({contentType:'dataUse',limit:1, offset:1, homepage: true}, req.__, 5000);

        Promise.all([news, dataUse, event, feature])
            .then(function(values){
                let highlights = {
                    news: _.get(values[0], 'results[0]'),
                    dataUse: _.get(values[1], 'results[0]'),
                    event: _.get(values[2], 'results[0]'),
                    feature: _.get(values[3], 'results[0]')
                };
                helper.renderPage(req, res, next, {
                    highlights: highlights,
                    _meta: {
                        title: 'GBIF',
                        bodyClass: 'hasTransparentMenu',
                        hideSearchAction: true
                    }
                }, 'pages/home/home');
            })
            .catch(function(){
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
