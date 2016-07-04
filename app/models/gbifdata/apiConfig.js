'use strict';

// TODO Use absolute path?
var baseConfig = require('../../../config/config');

var baseUrl = baseConfig.dataApi;
// TODO Establish URL concatenation policy.
var apiConfig = {
    base: {
        url: baseUrl
    },
    country: {
        url: baseUrl + 'node/country/'
    },
    dataset: {
        url: baseUrl + 'dataset/'
    },
    datasetSearch: {
        url: baseUrl + 'dataset/search/'
    },
    installation: {
        url: baseUrl + 'installation/'
    },
    node: {
        url: baseUrl + 'node/'
    },
    occurrence: {
        url: baseUrl + 'occurrence/'
    },
    occurrenceTerm: {
        url: baseUrl + 'occurrence/term/'
    },
    occurrenceInterpretation: {
        url: baseUrl + 'occurrence/interpretation/'
    },
    occurrenceDownloadDataset: {
        url: baseUrl + 'occurrence/download/dataset/'
    },
    publisher: {
        url: baseUrl + 'organization/'
    },
    taxon: {
        url: baseUrl + 'species/'
    },
    speciesParsedName: {
        url: baseUrl + 'species/'
    }
};

module.exports = Object.freeze(apiConfig);