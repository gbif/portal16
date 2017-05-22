'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('Dataset', function ($resource, env) {
            return $resource(env.dataApi + 'dataset/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('DatasetExtended', function ($resource) {
            return $resource('/api/dataset/:key', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('DatasetSearch', function ($resource) {
            //var facets = {
            //    facet: ['type', 'keyword', 'publishing_org', 'hosting_org', 'publishing_country', 'decade']
            //};
            return $resource('/api/dataset/search', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('DatasetDownloadStats', function ($resource) {
            return $resource('/api/dataset/stats/download/:id', null, {
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

