var express = require('express'),
    search = require('./search'),
    highlights = require('./highlights'),
    baseConfig = require('../../../config/config'),
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
                hideSearchAction: true
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

        // handling type-url conversion for CMS contents
        // @todo use a node module to handle all possible cases once more content types are ready.
        if (results.articles.results.length > 0) {
            results.articles.results.forEach(function(result){
                switch (result.type) {
                    case 'news':
                        result.type = 'news';
                        break;
                    case 'data_use':
                        result.type = 'data-use';
                        break;
                    case 'event':
                        result.type = 'event';
                        break;
                    case 'resource':
                        result.type = 'resource';
                        break;
                    case 'gbif_participant':
                        result.type = 'participant';
                        break;
                    case 'page':
                        result.type = 'page';
                        break;
                    case 'programme':
                        result.type = 'programme';
                        break;
                    case 'project':
                        result.type = 'project';
                        break;
                    case 'external':
                        result.type = 'external';
                        break;
                }});
        }
        results.highlights = highlights.getHighlights(searchString, results);

        var context = {
            results: results,
            query: searchString,
            _meta: {
                bodyClass: 'omnisearch',
                hideSearchAction: true,
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
