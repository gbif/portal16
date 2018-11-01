'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    request = rootRequire('app/helpers/request'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    log = require('../../../../../config/log');

const querystring = require('querystring');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/occurrence/datasets', function(req, res) {
    // clear all facets and ask for datasetKey facet only
    req.query.facet = 'datasetKey';

    // get one more facet than asked for and use that to test for last
    let facetLimit = parseInt(req.query.limit) || 20;
    let offset = parseInt(req.query.offset) || 0;
    req.query.facetOffset = offset;
    req.query.facetLimit = facetLimit + 1;

    // We do not care about the result count
    req.query.limit = 0;
    req.query.offset = undefined;

    getDatasets(req.query)
        .then(function(result) {
            res.json(result);
        })
        .catch(function(err) {
            log.error(err);
            res.sendStatus(_.get(err, 'errorResponse.statusCode', 500));
        });
});

async function getDatasets(query) {
    let endOfRecords = false;
    let occurrences = await occurrenceSearch(query);
    let datasetKeys = _.get(occurrences, 'facets[0].counts', []);

    // only return the amount asked for, and since we addded one to test for last, then remove last
    if (datasetKeys.length <= (query.facetLimit - 1)) {
        endOfRecords = true;
    } else {
        datasetKeys.pop();
    }

    // Get datasets from keys in facet
    let datasetPromises = datasetKeys.map(function(e) {
        return getDataset(e.name);
    });
    let datasets = await Promise.all(datasetPromises);
    datasets = datasets.map(function(e, i) {
        return {
            key: e.key,
            title: e.title,
            type: e.type,
            created: e.created,
            publishingOrganizationKey: e.publishingOrganizationKey,
            publishingOrganizationTitle: e.publishingOrganizationTitle,
            publishingCountry: e.publishingCountry,
            description: _.isString(e.description) ? e.description.substr(0, 200) : undefined,
            _count: datasetKeys[i].count
        };
    });
    return {
        endOfRecords: endOfRecords,
        limit: query.facetLimit - 1,
        offset: query.facetOffset,
        results: datasets
    };
}

async function occurrenceSearch(query) {
    let options = {
        url: apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query),
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

async function getDataset(key) {
    let options = {
        url: apiConfig.dataset.url + key,
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    let publisher = await getPublisher(response.body.publishingOrganizationKey);
    response.body.publishingOrganizationTitle = publisher.title;
    response.body.publishingCountry = publisher.country;
    return response.body;
}

async function getPublisher(key) {
    let options = {
        url: apiConfig.publisher.url + key,
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}
