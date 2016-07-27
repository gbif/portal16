'use strict';

var baseConfig = require('../../../config/config');

var baseUrl = baseConfig.cmsApi;
var apiConfig = {
    base: {
        url: baseUrl
    },
    news: {
        url: baseUrl + 'news/'
    },
    dataset: {
        url: baseUrl + 'dataset/'
    },
    dataUse: {
        url: baseUrl + 'data-use/'
    },
    event: {
        url: baseUrl + 'event/'
    },
    resource: {
        url: baseUrl + 'resource/'
    },
    participant: {
        url: baseUrl + 'gbif_participant/'
    },
    page: {
        url: baseUrl + 'page/'
    },
    programme: {
        url: baseUrl + 'programme/'
    },
    project: {
        url: baseUrl + 'project/'
    },
    search: {
        url: baseUrl + 'search/'
    },
    urlLookup: {
        url: baseUrl + 'url-lookup/'
    },
    datasetRefLookup: {
        url: baseUrl + 'dataset-ref-lookup/'
    }
};

module.exports = Object.freeze(apiConfig);