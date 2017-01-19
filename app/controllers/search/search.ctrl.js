var express = require('express'),
    search = require('./search'),
    highlights = require('./highlights'),
    baseConfig = require('../../../config/config'),
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    Utilities = require('../api/cms/cmsUtilities'),
    _ = require('lodash'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/search', function (req, res, next) {
    try {
        var searchString = req.query.q,
            context = {
                query: searchString,
                _meta: {
                    bodyClass: 'omnisearch',
                    tileApi: baseConfig.tileApi,
                    hideFooter: true,
                    hideSearchAction: true,
                    title: res.__('stdTerms.search')
                }
            };

        res.render('pages/search/search', context);
    } catch (err) {
        next(err);
    }
});

router.get('/search/partial\.:ext?', function (req, res) {
    searchHandler(req, res);
});

function searchHandler(req, res, next) {
    "use strict";
    var searchString = req.query.q;

    search.search(searchString, function (results) {
        try {
            if (_.has(results, 'cms.results.length')) {
                // handling type-url conversion for CMS contents
                results.cms.results.forEach(function (result) {
                    switch (result.type) {
                        case 'data_use':
                            result.type = 'data-use';
                            break;
                        case 'gbif_participant':
                            result.type = 'participant';
                            break;
                        case 'external':
                            result.type = 'external';
                            break;
                    }
                });
                // decorate with literature URL according to content type
                Utilities.literatureUrl(results.cms.results);
            }
            results.highlights = highlights.getHighlights(searchString, results);

            var context = {
                results: results,
                query: searchString,
                _meta: {
                    bodyClass: 'omnisearch',
                    hideSearchAction: false,
                    hideFooter: true,
                    tileApi: baseConfig.tileApi,
                    imageCacheUrl: imageCacheUrl
                }
            };
            renderPage(req, res, next, context);
        } catch (err) {
            next(err);
        }
    });
}

function renderPage(req, res, next, context) {
    try {
        //do not cache partial results.
        if (context.results.isPartialResponse) {
            res.setHeader('Cache-Control', 'no-cache');
        }
        if (req.params.ext == 'debug') {
            res.json(context);
        } else {
            res.render('pages/search/searchPartial', context);
        }
    } catch (err) {
        next(err);
    }
}
