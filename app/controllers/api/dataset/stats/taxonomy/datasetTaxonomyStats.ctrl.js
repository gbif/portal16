"use strict";
var express = require('express'),
    router = express.Router(),
    log = rootRequire('config/log'),
    _ = require('lodash'),
    request = require('requestretry');


module.exports = function (app) {
    app.use('/api', router);
};

router.get('/dataset/taxonomy/:key', function (req, res) {
    var datasetKey = req.params.key;

});

/*
async function getChecklistTaxonomy(key) {

// http://api.gbif.org/v1/species/search?datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&facet=higherTaxonKey&rank=species&facetLimit=100&limit=0
    let baseRequest = {
        url: apiConfig.taxonSearch.url +  '?' + querystring.stringify({datasetKey : key, facet: 'higherTaxonKey', facetLimit : 100, limit: 0 }),
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let response = await request(baseRequest);
    if (response.statusCode > 299) {
        throw response;
    }
    let dataset = response.body;
    dataset._computedValues = {};
    dataset._computedValues.contributors = contributors.getContributors(dataset.contacts);

    clean(dataset);

    let projectContacts = _.get(dataset, 'project.contacts', false);
    if (projectContacts) {
        dataset._computedValues.projectContacts = contributors.getContributors(projectContacts);
    }

    let taxonomicCoverages = _.get(dataset, 'taxonomicCoverages', false);
    if (taxonomicCoverages) {
        dataset._computedValues.taxonomicCoverages = taxonomicCoverage.extendTaxonomicCoverages(taxonomicCoverages);
    }

    dataset._computedValues.bibliography = bibliography.getBibliography(dataset.bibliographicCitations);

    return dataset;
} */