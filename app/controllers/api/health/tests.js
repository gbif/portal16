let severity = require('./severity').severity,
    config = require('../../../../config/config'),
    backboneKey = config.publicConstantKeys.dataset.backbone,
    apiConfig = require('../../../models/gbifdata/apiConfig');

//select which es content to query
let crawlIndexName = 'prod-crawl-*',
    varnishIndexName = 'prod-varnish-*',
    downloadKey = '0000662-160118175350007';
switch (config.dev) {
    case 'dev':
        crawlIndexName = 'dev-crawl-*';
        varnishIndexName = 'dev-varnish-*';
        downloadKey = '0000069-171031135223121';
        break;
    case 'uat':
        crawlIndexName = 'uat-crawl-*';
        varnishIndexName = 'uat-varnish-*';
        downloadKey = '0000046-171108114045140';
        break;
    default:
        break;
}
var tests = [
    {
        url: apiConfig.occurrenceSearch.url,
        component: 'OCCURRENCE'
    },
    {
        url: apiConfig.occurrenceSearch.url + '?basisOfRecord=NONSENSE',
        component: 'OCCURRENCE',
        type: 'STATUS',
        val: 400,
        message: 'Should fail for nonsensical queries'
    },
    {
        url: apiConfig.occurrenceSearch.url + '?q={RANDOM_WORD}',
        component: 'OCCURRENCE',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 15000,
        severity: severity.WARNING,
        message: 'Should respond with free text query within 15 seconds - else warn'
    },
    {
        url: apiConfig.occurrenceSearch.url + '?q={RANDOM_WORD}',
        component: 'OCCURRENCE',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 40000,
        message: 'Should respond with free text query within 40 seconds - else the performance is considered critical'
    },
    {
        url: apiConfig.taxonSearch.url + '?q={RANDOM_WORD}',
        component: 'SPECIES',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 8000,
        severity: severity.WARNING,
        message: 'Should respond with free text query within 8 seconds - else warn'
    },
    {
        url: apiConfig.taxon.url + '42',
        component: 'SPECIES',
        message: 'A specific species key (42) should resolve'
    },
    {
        url: apiConfig.taxon.url + 'suggest?datasetKey=' + backboneKey + '&limit=10&q=puma+concolor+(Linnaeus,+1771)',
        component: 'SPECIES',
        randomWord: true,
        type: 'HAVE_VALUE',
        key: '[0].scientificName',
        val: 'Puma concolor (Linnaeus, 1771)',
        severity: severity.WARNING,
        message: 'Species suggest should always show the species first when searching for the exact name'
    },
    {
        url: apiConfig.datasetSearch.url + '?q={RANDOM_WORD}',
        component: 'REGISTRY',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 6000,
        message: 'Dataset search should respond within 6 seconds on a search'
    },
    {
        url: apiConfig.dataset.url + backboneKey,
        component: 'REGISTRY',
        message: 'A specific dataset key should work (backbone)'
    },
    {
        url: apiConfig.mapCapabilities.url + '?taxonKey=42',
        component: 'MAPS',
        type: 'NUMBER_ABOVE',
        key: 'total',
        val: 100,
        message: 'Map capabilities for taxonKey 42 should return a json with a total above 100'
    },
    {
        url: apiConfig.mapOccurrenceDensity.url + '0/0/0@1x.png',
        component: 'MAPS',
        message: 'Map occurrence density requests should return 200'
    },
    {
        url: config.serverProtocol + config.basemapTileApi + '/4326/omt/2/3/1@1x.png',
        component: 'MAPS',
        message: 'Basemap requests should return 200'
    },
    {
        url: apiConfig.occurrenceDownload.url + downloadKey,
        component: 'DOWNLOAD',
        message: 'download key 0000662-160118175350007 should return 200'
    },
    {
        url: apiConfig.occurrenceCancelDownload.url,
        method: 'POST',
        component: 'DOWNLOAD',
        type: 'STATUS',
        val: 415,
        message: 'Should return 415 on empty posts to download/request'
    },
    {
        url: 'https://www.contentfulstatus.com/history.json',
        component: 'CONTENTFUL',
        type: 'HAVE_VALUE',
        key: 'components[0].status',
        val: 'operational',
        message: 'The contentful status endpoint should should return "operational" for components[0].status'
    },
    {
        url: 'https://status.github.com/api/status.json',
        component: 'GITHUB',
        type: 'HAVE_VALUE',
        key: 'status',
        val: 'good',
        message: 'The Github status endpoint should should return "good"'
    },
    {
        url: config.domain + '/api/resource/search?contentType=dataUse',
        component: 'RESOURCE_SEARCH',
        type: 'NUMBER_ABOVE',
        key: 'count',
        val: 100,
        message: 'Resource search should return more than 100 results for a search on content type = data use'
    },
    {
        url: apiConfig.elkSearch.url + crawlIndexName + '/_search?q=log_timestamp:%3E{SECONDS_AGO}',
        component: 'CRAWLER',
        secondsAgo: 180,
        type: 'NUMBER_ABOVE',
        key: 'hits.total',
        val: 0,
        message: 'There should be a log entry from the crawler within the last 150 seconds'
    },
    {
        url: apiConfig.elkSearch.url + varnishIndexName + '/_search?q=response:>499%20AND%20request:("//api.gbif.org/v1/occurrence/search*")%20AND%20@timestamp:>{SECONDS_AGO}',
        component: 'OCCURRENCE',
        secondsAgo: 180,
        type: 'NUMBER_BELOW',
        key: 'hits.total',
        val: 50,
        severity: severity.WARNING,
        message: 'There has been more than 50 errors on occurrence search in the last 5 minutes'
    }
];

module.exports = tests;