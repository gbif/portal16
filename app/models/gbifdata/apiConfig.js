'use strict';

// TODO Use absolute path?
var baseConfig = require('../../../config/config');

var baseUrl = baseConfig.dataApi;
// TODO Establish URL concatenation policy.
var apiConfig = {
    base: {
        url: baseUrl
    },
    dataset: {
        url: baseUrl + 'dataset/'
    },
    occurrence: {
        url: baseUrl + 'occurrence/'
    },
    occurrenceDownloadDataset: {
        url: baseUrl + 'occurrence/download/dataset/'
    },
    publisher: {
        url: baseUrl + 'organization/'
    },
    installation: {
        url: baseUrl + 'installation/'
    },
    speciesParsedName: {
        url: baseUrl + 'species/'
    }
};

module.exports = Object.freeze(apiConfig);