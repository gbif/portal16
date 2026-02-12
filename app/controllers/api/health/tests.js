let severity = require('./severity').severity,
    config = require('../../../../config/config'),
    backboneKey = config.publicConstantKeys.dataset.backbone,
    apiConfig = require('../../../models/gbifdata/apiConfig');

// select which es content to query
let downloadKey = '0000222-130906152512535';
// let crawlHostName = 'prodcrawler1-vh.gbif.org';
// let varnishIndexName = 'prod-varnish-*';
// let publicCrawlIndexName = 'prod-crawl-*';
switch (config.healthEnv || config.env) {
    case 'dev':
        // crawlHostName = 'devcrawler1-vh.gbif.org';
        // varnishIndexName = 'dev-varnish-*';
        // publicCrawlIndexName = 'dev-crawl-*';
        break;
    case 'uat':
        // crawlHostName = 'uatcrawler1-vh.gbif.org';
        // varnishIndexName = 'uat-varnish-*';
        // publicCrawlIndexName = 'uat-crawl-*';
        break;
    default:
        break;
}
let tests = [
    {
        url: apiConfig.occurrenceSearch.url + '?cachebust={NOW}',
        component: 'OCCURRENCE'
    },
    {
        url:
            apiConfig.occurrenceSearch.url +
            '?basisOfRecord=NONSENSE&cachebust={NOW}',
        component: 'OCCURRENCE',
        type: 'STATUS',
        val: 400,
        message: 'Should fail for nonsensical queries'
    },
    {
        url:
            apiConfig.occurrenceSearch.url + '?q={RANDOM_WORD}&cachebust={NOW}',
        component: 'OCCURRENCE',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 20000,
        severity: severity.WARNING,
        message:
            'Should respond with free text query within 20 seconds - else warn'
    },
    {
        url:
            apiConfig.occurrenceSearch.url + '?q={RANDOM_WORD}&cachebust={NOW}',
        component: 'OCCURRENCE',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 40000,
        message:
            'Should respond with free text query within 40 seconds - else the performance is considered critical'
    },
    {
        url: apiConfig.taxonSearch.url + '?q={RANDOM_WORD}&cachebust={NOW}',
        component: 'SPECIES',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 8000,
        severity: severity.WARNING,
        message:
            'Should respond with free text query within 8 seconds - else warn'
    },
    {
        url: apiConfig.taxon.url + '196?cachebust={NOW}',
        component: 'SPECIES',
        message: 'A specific species key (196) should resolve'
    },
    {
        url:
            apiConfig.taxon.url +
            'suggest?datasetKey=' +
            backboneKey +
            '&limit=10&q=puma+concolor+(Linnaeus,+1771)&cachebust={NOW}',
        component: 'SPECIES',
        randomWord: true,
        type: 'HAVE_VALUE',
        key: '[0].scientificName',
        val: 'Puma concolor (Linnaeus, 1771)',
        severity: severity.WARNING,
        message:
            'Species suggest should always show the species first when searching for the exact name'
    },
    {
        url: apiConfig.datasetSearch.url + '?q={RANDOM_WORD}&cachebust={NOW}',
        component: 'REGISTRY',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 10000,
        message: 'Dataset search should respond within 10 seconds on a search'
    },
    {
        url: apiConfig.dataset.url + backboneKey + '?cachebust={NOW}',
        component: 'REGISTRY',
        message: 'A specific dataset key should work (backbone)'
    },
    {
        url: apiConfig.userLogin.url + '?cachebust={NOW}',
        component: 'IDENTITY',
        type: 'STATUS',
        val: 401,
        message: 'Expect 401 when requesting login'
    },
    {
        url: apiConfig.mapCapabilities.url + '?taxonKey=1&cachebust={NOW}',
        component: 'MAPS',
        type: 'NUMBER_ABOVE',
        key: 'total',
        val: 100,
        message:
            'Map capabilities for taxonKey 1 should return a json with a total above 100'
    },
    {
        url:
            apiConfig.mapOccurrenceDensity.url + '0/0/0@1x.png?cachebust={NOW}',
        component: 'MAPS',
        message: 'Map occurrence density requests should return 200'
    },
    {
        url:
            config.serverProtocol +
            config.basemapTileApi +
            '/4326/omt/2/3/1@1x.png?cachebust={NOW}',
        component: 'MAPS',
        message: 'Basemap requests should return 200'
    },
    {
        url:
            apiConfig.occurrenceDownload.url + downloadKey + '?cachebust={NOW}',
        component: 'DOWNLOAD',
        message: 'download key ' + downloadKey + ' should return 200'
    },
    {
        url: 'http://status.github.com/api/v2/status.json',
        component: 'GITHUB',
        type: 'HAVE_VALUE',
        key: 'status.description',
        val: 'All Systems Operational',
        severity: severity.WARNING,
        message:
            'The Github status endpoint should should return "All Systems Operational"'
    },
    {
        url:
            'http://www.' +
            config.topDomain +
            '/api/resource/search?contentType=literature&cachebust={NOW}',
        component: 'RESOURCE_SEARCH',
        type: 'NUMBER_ABOVE',
        key: 'count',
        val: 7000,
        message:
            'Resource search should return more than 7000 results for a search on content type = literature'
    },
    {
        url:
            'http://www.' +
            config.topDomain +
            '/api/resource/search?contentType=dataUse&cachebust={NOW}',
        component: 'RESOURCE_SEARCH',
        type: 'NUMBER_ABOVE',
        key: 'count',
        val: 100,
        message:
            'Resource search should return more than 100 results for a search on content type = data use'
    },
    /*     {
        url: 'http:' + apiConfig.publicKibana.url + 'q=service:"crawler-coordinator-cleanup"%20AND%20@timestamp:%3E{SECONDS_AGO}&index=' + publicCrawlIndexName,
        component: 'CRAWLER',
        secondsAgo: 180,
        type: 'NUMBER_ABOVE',
        key: 'hits.total',
        val: 0,
        message: 'There should be a log entry from the crawler within the last 180 seconds'
    }, */
    {
        url: apiConfig.crawlingDatasetProcessRunning.url + '?cachebust={NOW}',
        component: 'CRAWLER',
        message: 'The crawl queue should be available'
    },
    // {
    //     url: apiConfig.elkSearch.url + varnishIndexName + '/_search?q=response:>499%20AND%20request:("//api.gbif.org/v1/occurrence/search*")%20AND%20@timestamp:>{SECONDS_AGO}',
    //     component: 'OCCURRENCE',
    //     secondsAgo: 180,
    //     type: 'NUMBER_BELOW',
    //     key: 'hits.total',
    //     val: 50,
    //     severity: severity.WARNING,
    //     message: 'There has been more than 50 errors on occurrence search in the last 5 minutes'
    // },
    // {
    //     url:
    //         config.serverProtocol +
    //         apiConfig.image.url +
    //         encodeURIComponent('http://rs.gbif.org/style/logo.svg') +
    //         '?cachebust={NOW}',
    //     component: 'IMAGE_CACHE',
    //     severity: severity.WARNING,
    //     message: 'Image cache should return 200 for an image'
    // }
];

module.exports = tests;
