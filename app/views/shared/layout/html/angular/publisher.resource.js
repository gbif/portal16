'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('Publisher', function ($resource, env) {
            return $resource(env.dataApi + 'organization/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('PublisherSearch', function ($resource) {
            return $resource('/api/publisher/search', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        // Accepting gbifRegion as param
        // return number of publishers in the region
        .factory('PublisherCount', function ($resource) {
            return $resource('/api/publisher/count',
                {gbifRegion: 'GLOBAL'},
                {
                    'get': {
                        method: 'GET',
                        params: {gbifRegion: '@gbifRegion'},
                        isArray: false
                    }
                });
        })
        // Accepting iso2 as param
        // return number of endorsed publishers
        .factory('PublisherEndorsedBy', function ($resource) {
            return $resource('/api/publisher/endorsed-by/:iso2', null,
                {
                    'get': {
                        method: 'GET',
                        params: {iso2: '@iso2'},
                        isArray: false
                    }
                });
        })
        ;
})();

