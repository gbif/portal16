'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('TaxonomyRoot', function($resource) {
            return $resource('/api/taxonomy/:datasetKey', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('TaxonomyDetail', function($resource) {
            return $resource('/api/taxonomy/:datasetKey/:taxonKey', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('TaxonomySynonyms', function($resource) {
            return $resource('/api/taxonomy/:datasetKey/:taxonKey/synonyms', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('TaxonomyCombinations', function($resource) {
            return $resource('/api/species/:taxonKey/combinations', null, {
                    'query': {
                        method: 'GET',
                        isArray: true
                    }
                }
            );
        })
        .factory('TaxonomyChildren', function($resource) {
            return $resource('/api/taxonomy/:datasetKey/:taxonKey/children', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('TaxonomyParents', function($resource) {
            return $resource('/api/taxonomy/:datasetKey/:taxonKey/parents', null, {
                    'query': {
                        method: 'GET',
                        isArray: true
                    }
                }
            );
        });
})();

