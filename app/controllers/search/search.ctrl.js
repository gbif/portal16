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

        //did it everything go well? if not flag it for display on the page so that the user know that this result is partial. but still show what we have.
        var hasInvalidResponses = Object.keys(results).reduce( function(prev, curr) {
            return _.get(results, curr + '.errorType') === 'INVALID_RESPONSE' || prev
        }, false);

        //TODO sloppy test. Should check if there is any errors and probably get them from the model in a better way.
        //Test if there are errors on nested calls
        if (results.taxaMatches && results.taxaMatches[0]) {
            hasInvalidResponses = Object.keys(results.taxaMatches[0]).reduce(function (prev, curr) {
                return _.get(results.taxaMatches[0], curr + '.errorType') === 'INVALID_RESPONSE' || prev
            }, hasInvalidResponses);
        }

        var context = {
            __hideSearchAction: true,
            results: results,
            hasInvalidResponses: hasInvalidResponses,
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