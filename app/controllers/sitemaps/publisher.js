"use strict";
var apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    config = rootRequire('config/config'),
    querystring = require('querystring'),
    request = require('requestretry'),
    _ = require('lodash');

module.exports = {
    getPublisherIntervals: getPublisherIntervals,
    getPublisher: getPublisher
};

async function getPublisherIntervals() {
    let options = {
        url: apiConfig.publisher.url,
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

async function getPublisher(query) {
    query.datasetKey = config.backboneDatasetKey;
    let options = {
        url: apiConfig.publisher.url + '?' + querystring.stringify(query),
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