'use strict';

let express = require('express'),
    helper = rootRequire('app/models/util/util'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    backboneKey = rootRequire('config/config').publicConstantKeys.dataset.backbone,
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    Taxon = require('../../../models/gbifdata/gbifdata').Taxon,
    querystring = require('querystring'),
    request = rootRequire('app/helpers/request'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

router.get('/species/:key/verbatim', function render(req, res, next) {
    renderSpeciesPage(req, res, next);
});

router.get('/species/:key/metrics', function render(req, res, next) {
    renderSpeciesPage(req, res, next);
});

router.get('/species/:key(\\d+).:ext?', function render(req, res, next) {
    renderSpeciesPage(req, res, next);
});

router.get('/species/:key(\\d+)/:ignore', function render(req, res) {
    res.redirect(302, res.locals.gb.locales.urlPrefix + '/species/' + req.params.key);
});


function renderSpeciesPage(req, res, next) {
    let speciesKey = req.params.key;
    let options = {
        expand: ['descriptions', 'dataset', 'synonyms', 'combinations', 'media', 'references', 'homonyms', 'vernacular', 'occurrenceImages']
    };

    Taxon.get(speciesKey, options).then(function(taxon) {
        let contentItem = {
            species: taxon,
            _meta: {
                title: taxon.record.scientificName,
                imageCacheUrl: imageCacheUrl
            }
        };
        helper.renderPage(req, res, next, contentItem, 'pages/species/key/seo');
    }).catch(function(err) {
        if (err.type === 'NOT_FOUND') {
            next();
        } else {
            next(err);
        }
    });
}

router.get('/species/first', function(req, res, next) {
    if (req.query.sourceId) {
        speciesBySourceId(req.query).then(function(resp) {
            if (resp.results && resp.results.length === 1) {
                res.redirect(302, res.locals.gb.locales.urlPrefix + '/species/' + resp.results[0].key);
            } else {
                res.redirect(302, res.locals.gb.locales.urlPrefix + '/species/search?' + querystring.stringify(req.query));
            }
        }, function(err) {
            next(err);
        });
    } else {
        if (!req.query.datasetKey) {
            if (req.query.backboneOnly !== 'false') {
                req.query.datasetKey = backboneKey;
            } else {
                req.query.advanced = 1;
            }
        }
        speciesSearchFirst(req.query).then(function(resp) {
            if (resp.count == 1) {
                res.redirect(302, res.locals.gb.locales.urlPrefix + '/species/' + resp.results[0].key);
            } else {
                res.redirect(302, res.locals.gb.locales.urlPrefix + '/species/search?' + querystring.stringify(req.query));
            }
        }, function(err) {
            next(err);
        });
    }
});

async function speciesSearchFirst(query) {
    let baseRequest = {
        url: apiConfig.taxonSearch.url + '?' + querystring.stringify(query),
        method: 'GET',
        json: true,
        fullResponse: true
    };
    let response = await request(baseRequest);
    if (response.statusCode != 200) {
        throw response;
    }
    return response.body;
}

async function speciesBySourceId(query) {
    let baseRequest = {
        url: apiConfig.taxon.url + '?' + querystring.stringify(query),
        method: 'GET',
        json: true,
        fullResponse: true
    };
    let response = await request(baseRequest);
    if (response.statusCode != 200) {
        throw response;
    }
    return response.body;
}
