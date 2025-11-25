'use strict';

let express = require('express'),
    helper = rootRequire('app/models/util/util'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    backboneKey = rootRequire('config/config').publicConstantKeys.dataset.backbone,
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    Taxon = require('../../../models/gbifdata/gbifdata').Taxon,
    querystring = require('querystring'),
    request = rootRequire('app/helpers/request'),
    router = express.Router({caseSensitive: true}),
    _ = require('lodash');

module.exports = function(app) {
    app.use('/', router);
};

router.get('/species/:key/verbatim', function render(req, res, next) {
    renderSpeciesPage(req, res, next);
});

router.get('/species/:key/metrics', function render(req, res, next) {
    renderSpeciesPage(req, res, next);
});

router.get('/species/:key/treatments', function render(req, res, next) {
    renderSpeciesPage(req, res, next);
});

router.get('/species/:key/literature', function render(req, res, next) {
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
        expand: ['descriptions', 'dataset', 'synonyms', 'combinations', 'media', 'references', 'homonyms', 'vernacular', 'parents']
    };

    Taxon.get(speciesKey, options).then(function(taxon) {
        let contentItem = {
            species: taxon,
            _meta: {
                title: taxon.record.scientificName,
                imageCacheUrl: imageCacheUrl
            }
        };
        if (shouldAddSchemaMetaData(taxon.record)) {
            try {
                contentItem._meta.schema = getMetaSchema(taxon);
            } catch (err) {
                // ignore
            }
        }
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
    let target = req.query.target;
    let redirectToBackbone = target === 'backbone';
    if (req.query.sourceId) {
        speciesBySourceId(req.query).then(function(resp) {
            if (resp.results && resp.results.length === 1) {
                let redirectKey = redirectToBackbone && resp.results[0].nubKey ? resp.results[0].nubKey : resp.results[0].key;
                res.redirect(302, res.locals.gb.locales.urlPrefix + '/species/' + redirectKey);
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
                let redirectKey = redirectToBackbone && resp.results[0].nubKey ? resp.results[0].nubKey : resp.results[0].key;
                res.redirect(302, res.locals.gb.locales.urlPrefix + '/species/' + redirectKey);
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

function shouldAddSchemaMetaData(taxon) {
    return taxon.datasetKey = backboneKey && ['ACCEPTED', 'DOUBTFUL'].includes(taxon.taxonomicStatus);
}

function getSchemaTaxonName(taxon) {
    let name = {
        '@type': 'TaxonName',
        'name': taxon.canonicalName,
        'author': taxon.authorship,
        'taxonRank': taxon.rank
    };
    if (taxon.publishedIn) {
        name.isBasedOn = {
            '@type': 'ScholarlyArticle',
            'name': taxon.publishedIn
        };
    }
    return name;
}

function getMetaSchema(tx) {
    const taxon = tx.record;
    let schema = {
        '@context': [
            'https://schema.org/',
            {
                'dwc': 'http://rs.tdwg.org/dwc/terms/',
                'dwc:vernacularName': {'@container': '@language'}
            }
        ],
        '@type': 'Taxon',
        'http://purl.org/dc/terms/conformsTo': {
            '@type': 'Taxon',
            '@id': 'https://bioschemas.org/profiles/Taxon/0.6-RELEASE'
        },
        'additionalType': ['dwc:Taxon', 'http://rs.tdwg.org/ontology/voc/TaxonConcept#TaxonConcept'],
        'identifier': [
            {
                '@type': 'PropertyValue',
                'name': 'GBIF taxonKey',
                'propertyID': 'http://www.wikidata.org/prop/direct/P846',
                'value': taxon.key
            },
            {
                '@type': 'PropertyValue',
                'name': 'dwc:taxonID',
                'propertyID': 'http://rs.tdwg.org/dwc/terms/taxonID',
                'value': taxon.key
            }

        ],
        'name': taxon.scientificName,
        'scientificName': getSchemaTaxonName(taxon),

        'taxonRank': [
            `http://rs.gbif.org/vocabulary/gbif/rank/${taxon.rank.toLowerCase()}`, taxon.rank.toLowerCase()
        ]
    };
     if (_.get(tx, 'synonyms.results[0]')) {
        schema.alternateName = tx.synonyms.results.map((s) => s.scientificName);
        schema.alternateScientificName = tx.synonyms.results.map(getSchemaTaxonName);
    }
    if (_.get(tx, 'vernacular.results[0]')) {
        schema['dwc:vernacularName'] = tx.vernacular.results.map((v) => ({'@language': v.language, '@value': v.vernacularName}));
    }
    if (tx.parents && tx.parents.length > 0) {
        const parent = tx.parents[tx.parents.length - 1];
        schema.parentTaxon = {
            '@type': 'Taxon',
            'name': parent.scientificName,
            'scientificName': getSchemaTaxonName(parent),
            'identifier': [
                {
                    '@type': 'PropertyValue',
                    'name': 'GBIF taxonKey',
                    'propertyID': 'http://www.wikidata.org/prop/direct/P846',
                    'value': parent.key
                },
                {
                    '@type': 'PropertyValue',
                    'name': 'dwc:taxonID',
                    'propertyID': 'http://rs.tdwg.org/dwc/terms/taxonID',
                    'value': parent.key
                }
            ],
            'taxonRank': [
                `http://rs.gbif.org/vocabulary/gbif/rank/${parent.rank.toLowerCase()}`, parent.rank.toLowerCase()
            ]
        };
    }
    return schema;
}
