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
        try {
            if (results.articles.data.length > 0) {
                results.articles.data.forEach(function(datum){
                    datum.forEach(function(d){
                        switch (d.type) {
                            case 'news':
                                d.type = 'news';
                                break;
                            case 'data_use':
                                d.type = 'data-use';
                                break;
                            case 'event':
                                d.type = 'event';
                                break;
                            case 'resource':
                                d.type = 'resource';
                                break;
                            case 'gbif_participant':
                                d.type = 'participant';
                                break;
                            case 'page':
                                d.type = 'page';
                                break;
                            case 'programme':
                                d.type = 'programme';
                                break;
                            case 'project':
                                d.type = 'project';
                                break;
                            case 'external':
                                d.type = 'external';
                                break;
                        }
                    });
                });
            }
        }
        catch (e) {
            next(e);
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
