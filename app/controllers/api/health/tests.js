/*
 * ENDPOINTS TO CHECK
 * species search
 * occurrence search
 * regsitry (datasets/organisations)
 * crawler,
 * contentful,
 * directory,
 * suggest ?
 */

var severity = {
    OK: 0,
    WARNING: 1,
    CRITICAL: 2
};

var endpoints = {
    v1: 'http://api.gbif.org/v1'
};
var tests = [
    {
        url: endpoints.v1 + '/occurrence/search',
        component: 'OCCURRENCE'
    },
    {
        url: endpoints.v1 + '/occurrence/search?basisOfRecord=NONSENSE',
        component: 'OCCURRENCE',
        type: 'STATUS',
        val: 400,
        message: 'Should fail for nonsensical queries'
    },
    {
        url: endpoints.v1 + '/occurrence/search?q=RANDOM_WORD',
        component: 'OCCURRENCE',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 5000,
        severity: severity.WARNING
    },
    {
        url: endpoints.v1 + '/occurrence/search?q=RANDOM_WORD',
        component: 'OCCURRENCE',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 10000
    },
    {
        url: endpoints.v1 + '/species/search?q=RANDOM_WORD',
        component: 'SPECIES',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 3000
    },
    {
        url: endpoints.v1 + '/species/42',
        component: 'SPECIES'
    },
    {
        url: endpoints.v1 + '/species/suggest?datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&limit=10&q=puma+concolor',
        component: 'SPECIES',
        randomWord: true,
        type: 'HAVE_VALUE',
        key: '[0].scientificName',
        val: 'Puma concolor (Linnaeus, 1771)',
        severity: severity.WARNING
    },
    {
        url: endpoints.v1 + '/dataset/search?q=RANDOM_WORD',
        component: 'DATASET',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 3000
    },
    {
        url: endpoints.v1 + '/dataset/d7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
        component: 'DATASET'
    },
    {
        url: 'https://www.contentfulstatus.com/history.json',
        component: 'CONTENTFUL',
        type: 'HAVE_VALUE',
        key: 'components[0].status',
        val: 'operational'
    },
    {
        url: 'https://www.gbif.org/api/resource/search?contentType=dataUse',
        component: 'RESOURCE_SEARCH',
        type: 'NUMBER_ABOVE',
        key: 'count',
        val: 100
    }
];

module.exports = tests;