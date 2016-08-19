var express = require('express'),
    search = require('./search'),
    highlights = require('./highlights'),
    baseConfig = require('../../../config/config'),
    _ = require('lodash'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/search', function (req, res) {
    var searchString = req.query.q,
        context = {
            query: searchString,
            _meta: {
                bodyClass: 'omnisearch',
                tileApi: baseConfig.tileApi,
                hideFooter: true,
                hideSearchAction: false
            }
        };
    res.render('pages/search/search', context);
});

router.get('/search/partial\.:ext?', function (req, res) {
    searchHandler(req, res);
});

function searchHandler(req, res) {
    "use strict";
    var searchString = req.query.q;

    search.search(searchString, function(results){

        results.highlights = highlights.getHighlights(searchString, results);

        var context = {
            results: results,
            query: searchString,
            _meta: {
                bodyClass: 'omnisearch',
                hideSearchAction: false,
                hideFooter: true,
                tileApi: baseConfig.tileApi
            }
        };

        renderPage(req, res, context);
    });
}

function renderPage(req, res, context) {
    if (req.params.ext == 'debug') {
        res.json(context);
    } else {
        res.render('pages/search/searchPartial', context);
    }
}
