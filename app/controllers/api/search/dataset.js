"use strict";

var apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    request = require('requestretry');

async function get(key, depth) {
    depth = depth || 0;
    let baseRequest = {
        url: apiConfig.dataset.url + key,
        timeout: 30000,
        method: 'GET',
        json: true
    };
    let node = await request(baseRequest);
    if (node.statusCode > 299) {
        throw node;
    }
    if (depth > 0) {
        depth--;
        return expandNode(node.body, depth);
    } else {
        return node.body;
    }
}

async function expandNode(node){
    //TODO stub. inteded to expand foreign keys, related etc. datasetKey, constituentDatasetKey, name, references etc
    return node;
}

async function query(query, options){
    options = options || {};
    query = query || {};

    let baseRequest = {
        url: apiConfig.datasetSearch.url + '?' + querystring.stringify(query),
        timeout: options.timeout || 30000,
        method: 'GET',
        json: true
    };

    let datasets = await request(baseRequest);
    if (datasets.statusCode > 299) {
        throw datasets;
    }
    return datasets.body;
}

module.exports = {
    get: get,
    query: query
};