"use strict";
var apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    request = require('requestretry'),
    _ = require('lodash');

module.exports = {
    getDatasetIntervals: getDatasetIntervals,
    getDatasets: getDatasets
};

async function getDatasetIntervals() {
    let options = {
        url: apiConfig.datasetSearch.url,
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

async function getDatasets(query) {
    let options = {
        url: apiConfig.datasetSearch.url + '?' + querystring.stringify(query),
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