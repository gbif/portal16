'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('Dataset', function($resource, env) {
            return $resource(env.dataApi + 'dataset/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('DatasetExtended', function($resource) {
            return $resource('/api/dataset/:key', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('DatasetSearch', function($resource) {
            // var facets = {
            //    facet: ['type', 'keyword', 'publishing_org', 'hosting_org', 'publishing_country', 'decade']
            // };
            return $resource('/api/dataset/search', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('DatasetEventList', function($resource) {
            return $resource('/api/dataset/:datasetKey/event', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('DatasetEvent', function($resource) {
            return $resource('/api/dataset/:datasetKey/event/:eventKey', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('DatasetDownloadStats', function($resource) {
            return $resource('/api/dataset/stats/download/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('DatasetMetrics', function($resource, env) {
            return $resource(env.dataApi + 'dataset/:key/metrics', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('DatasetConstituents', function($resource, env) {
            return $resource(env.dataApi + 'dataset/:key/constituents', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('DatasetProcessSummary', function($resource) {
            return $resource('/api/dataset/:key/processSummary', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('DatasetCurrentCrawlingStatus', function($resource) {
            return $resource('/api/dataset/:key/crawling', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('DatasetChecklistTaxonomy', function($resource) {
            return $resource('/api/chart/checklist/:key/taxonomy', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('DatasetOccurrenceTaxonomy', function($resource) {
            return $resource('/api/chart/occurrence/sunburst', null, {
                    'query': {
                        method: 'GET',
                        isArray: true
                    }
                }
            );
        })
    ;
})();

