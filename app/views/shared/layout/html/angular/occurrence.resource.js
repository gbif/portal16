'use strict';

var angular = require('angular');

(function() {
    angular
        .module('portal')
        .factory('Occurrence', function($resource, env) {
            return $resource(env.dataApi + 'occurrence/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('OccurrenceVerbatim', function($resource, env) {
            return $resource(env.dataApi + 'occurrence/:id/verbatim', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('OccurrenceSearch', function($resource, env) {
            return $resource(env.dataApi + 'occurrence/search', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('OccurrenceTableSearch', function($resource) {
            return $resource('/api/occurrence/search', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('OccurrenceTaxonSearch', function($resource) {
            return $resource('/api/occurrence/taxon', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('OccurrenceBreakdown', function($resource) {
            return $resource('/api/occurrence/breakdown', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('OccurrenceDatasetSearch', function($resource) {
            return $resource('/api/occurrence/datasets', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        // This service connects to a proxy which returns processed result from /occurrence/download/dataset/:id.
        .factory('downloadKeyDatasets', function($resource, env) {
            return $resource(env.dataApi + 'occurrence/download/:id/datasets');
        })
        // deprecated metrics API, but in agreement with Tim R, it is to be used for now until we find a better solution that also performs 15/6/2017
        .factory('OccurrenceCountDatasets', function($resource, env) {
            return $resource(env.dataApi + 'occurrence/counts/datasets', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('OccurrenceTaxonomyChart', function($resource) {
            return $resource('/api/chart/occurrence/sunburst', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
    ;
})();
