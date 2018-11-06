'use strict';
let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    request = rootRequire('app/helpers/request'),
    _ = require('lodash');

module.exports = {
    installation: {intervals: getInstallationIntervals, list: getInstallationList},
    dataset: {intervals: getDatasetIntervals, list: getDatasetList},
    node: {intervals: getNodeIntervals, list: getNodeList},
    network: {intervals: getNetworkIntervals, list: getNetworkList},
    publisher: {intervals: getPublisherIntervals, list: getPublisherList}
};

function getDatasetIntervals() {
    return getIntervals(apiConfig.datasetSearch.url, {});
}
function getDatasetList(query) {
    return getList(apiConfig.datasetSearch.url, query);
}

function getPublisherIntervals() {
    return getIntervals(apiConfig.publisher.url, {isEndorsed: true});
}
function getPublisherList(query) {
    let q = _.assign({isEndorsed: true}, query);
    return getList(apiConfig.publisher.url, q);
}

function getInstallationIntervals() {
    return getIntervals(apiConfig.installation.url, {});
}
function getInstallationList(query) {
    return getList(apiConfig.installation.url, query);
}

function getNetworkIntervals() {
    return getIntervals(apiConfig.network.url, {});
}
function getNetworkList(query) {
    return getList(apiConfig.network.url, query);
}

function getNodeIntervals() {
    return getIntervals(apiConfig.node.url, {});
}
function getNodeList(query) {
    return getList(apiConfig.node.url, query);
}

async function getIntervals(url, query, limit) {
    limit = limit || 1000;
    let options = {
        url: url + '?' + querystring.stringify(query),
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    let ranges = _.range(0, response.body.count, limit);
    return ranges.map(function(e) {
        return {limit: limit, offset: e};
    });
}

async function getList(url, query) {
    let options = {
        url: url + '?' + querystring.stringify(query),
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
