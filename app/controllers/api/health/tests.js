/*
 * ENDPOINTS TO CHECK
 * species search
 * occurrence search,
 * publisher search ?
 * resource/mendeley search, (only possible on network, so portal only for now)
 * downloads get adn create,
 * dataset download activity,
 * regsitry (datasets/organisations)
 * crawler,
 * bid website,
 * contentful,
 * directory,
 * suggest ?
 * maps (capabilities) data older than usual (more than 1 day fx or not updated this night)
 * using kibana logging to estimate load and stability
 *
 * like random words, then have random existing species names from the backbone to query for. Both for search and suggest.
 */

let severity = require('./severity').severity;

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
        url: endpoints.v1 + '/occurrence/search?q={RANDOM_WORD}',
        component: 'OCCURRENCE',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 5,
        severity: severity.CRITICAL
    },
    {
        url: endpoints.v1 + '/occurrence/search?q={RANDOM_WORD}',
        component: 'OCCURRENCE',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 10000
    },
    {
        url: endpoints.v1 + '/species/search?q={RANDOM_WORD}',
        component: 'SPECIES',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 3,
        severity: severity.WARNING
    },
    {
        url: endpoints.v1 + '/species/42',
        component: 'SPECIES'
    },
    {
        url: endpoints.v1 + '/species/suggest?datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&limit=10&q=puma+concolor+(Linnaeus,+1771)',
        component: 'SPECIES',
        randomWord: true,
        type: 'HAVE_VALUE',
        key: '[0].scientificName',
        val: 'Puma concolor (Linnaeus, 1771) XXX',
        severity: severity.WARNING
    },
    {
        url: endpoints.v1 + '/dataset/search?q={RANDOM_WORD}',
        component: 'REGISTRY',
        randomWord: true,
        type: 'MAX_RESPONSE_TIME',
        val: 3000
    },
    {
        url: endpoints.v1 + '/dataset/d7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
        component: 'REGISTRY'
    },
    {
        url: 'https://www.contentfulstatus.com/history.json',
        component: 'CONTENTFUL',
        type: 'HAVE_VALUE',
        key: 'components[0].status',
        val: 'operational'
    },
    {
        url: 'https://status.github.com/api/status.json',
        component: 'GITHUB',
        type: 'HAVE_VALUE',
        key: 'status',
        val: 'good'
    },
    {
        url: 'https://www.gbif.org/api/resource/search?contentType=dataUse',
        component: 'RESOURCE_SEARCH',
        type: 'NUMBER_ABOVE',
        key: 'count',
        val: 100
    },
    {
        url: 'http://elk.gbif.org:5601/elasticsearch/prod-crawl-*/_search?q=log_timestamp:%3E{SECONDS_AGO}',
        component: 'CRAWLER',
        secondsAgo: 150,
        type: 'NUMBER_ABOVE',
        key: 'hits.total',
        val: 0
    }
];


//var componentTests = [
//    {
//        name: 'OCCURRENCE_API',
//        url: '/read_more', //optional
//        tests: [{}]
//    }
//];
//
//var tests = {
//    time: '2017-12...',
//    status: 'OPERATIONAL', //summary state
//    components: [
//        {
//            name: 'OCCURRENCE_API',
//            url: '/sdf', //optional
//            status: 'OPERATIONAL',
//            time: '2017-12...',
//            running: false,
//            errors: [
//                {
//                    timestamp: '2017...',
//                    message: 'message number 1',
//                    details: 'dfgh'
//                }
//            ]
//        }
//    ]
//};

module.exports = tests;