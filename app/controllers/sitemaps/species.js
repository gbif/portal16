"use strict";
var apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    config = rootRequire('config/config'),
    querystring = require('querystring'),
    request = require('requestretry'),
    _ = require('lodash'),
    query = {
        datasetKey: config.backboneDatasetKey
    };

module.exports = {
    getSpeciesIntervals: getSpeciesIntervals,
    getSpecies: getSpecies
};

async function getSpeciesIntervals() {
    let options = {
        url: apiConfig.taxonSearch.url + '?' + querystring.stringify(query),
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    let limit = 10000,
        ranges = _.range(0, response.body.count, limit);
    return ranges.map(function(e){return {limit: limit, offset: e}});
}

async function getSpecies(query) {
    query.datasetKey = config.backboneDatasetKey;
    let options = {
        url: apiConfig.taxonSearch.url + '?' + querystring.stringify(query),
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