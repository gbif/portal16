var express = require('express'),
    _ = require('lodash'),
    search = require('./search'),
    highlights = require('./highlights'),
    baseConfig = require('../../../config/config'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/search\.:ext?', function (req, res) {
    searchHandler(req, res);
});

function searchHandler(req, res) {
    "use strict";
    var searchString = req.query.q;
    search.search(searchString, function(results){
        results.highlights = highlights.getHighlights(searchString, results);

        var context = {
            __hideSearchAction: true,
            results: results,
            query: searchString,
            meta: {
                bodyClass: 'omnisearch',
                tileApi: baseConfig.tileApi
            }
        };

        renderPage(req, res, context);
    });
}

function renderPage(req, res, context) {
    if (req.params.ext == 'json') {
        res.json(context);
    } else if (req.params.ext == 'partial') {
        res.render('pages/search/searchPartial', context);
    } else {
        res.render('pages/search/search', context);
    }
}
