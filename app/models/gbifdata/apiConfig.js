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
    occurrenceTerm: {
        url: baseUrl + 'occurrence/term/', 
    },
    occurrenceInterpretation: {
        url: baseUrl + 'occurrence/interpretation'
    },
    occurrenceDownloadDataset: {
        url: baseUrl + 'occurrence/download/dataset/'
    },
    taxon: {
        url: baseUrl + 'species/'
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