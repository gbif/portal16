'use strict';

var baseConfig = require('../../../config/config');
var baseUrl = baseConfig.dataApi;

// TODO Establish URL concatenation policy. Always no trailing slash?
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
    image: {
        url: baseUrl + 'image/unsafe/'
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
    occurrenceSearch: {
        url: baseUrl + 'occurrence/search/'
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
    taxonRoot: {
        url: baseUrl + 'species/root/'
    },
    taxonSearch: {
        url: baseUrl + 'species/search/'
    },
    taxonMatch: {
        url: baseUrl + 'species/match'
    },
    directoryParticipants: {
        url: baseUrl + 'directory/participant?limit=300'
    },
    directoryParticipant: {
        url: baseUrl + 'directory/participant'
    },
    directoryNode: {
        url: baseUrl + 'directory/node'
    },
    directoryPerson: {
        url: baseUrl + 'directory/person'
    },
    directoryPersonRole: {
        url: baseUrl + 'directory/person_role?limit=100'
    },
    directoryCommittee: {
        url: baseUrl + 'directory/committee'
    },
    directoryReport: {
        url: baseUrl + 'directory/report'
    }
};

module.exports = Object.freeze(apiConfig);
