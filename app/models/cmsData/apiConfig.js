'use strict';

let baseConfig = require('../../../config/config'),
    baseUrl = baseConfig.serverProtocol + baseConfig.cmsApi;

let apiConfig = {
    base: {
        url: baseUrl
    },
    news: {
        url: baseUrl + 'v1/news/'
    },
    dataset: {
        url: baseUrl + 'v1/dataset/'
    },
    dataUse: {
        url: baseUrl + 'v1/data-use/'
    },
    event: {
        url: baseUrl + 'v1/event/'
    },
    generic: {
        url: baseUrl + 'v1/generic/'
    },
    resource: {
        url: baseUrl + 'v1/resource/'
    },
    participant: {
        url: baseUrl + 'v1/gbif_participant/'
    },
    page: {
        url: baseUrl + 'v1/page/'
    },
    programme: {
        url: baseUrl + 'v1/programme/'
    },
    project: {
        url: baseUrl + 'v1/project/'
    },
    search: {
        url: baseUrl + 'v2/search/'
    },
    tag: {
        url: baseUrl + 'v1/tag/'
    },
    count: {
        url: baseUrl + 'v1/count/'
    },
    urlLookup: {
        url: baseUrl + 'v1/url-lookup/'
    },
    datasetRefLookup: {
        url: baseUrl + 'v1/dataset-ref-lookup/'
    }
};

module.exports = Object.freeze(apiConfig);