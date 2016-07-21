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
        url: baseUrl + 'data_use/'
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
    search: {
        url: baseUrl + 'search/'
    },
    urlLookup: {
        url: baseUrl + 'urllookup/'
    }
};

module.exports = Object.freeze(apiConfig);