'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('Publisher', function($resource, env) {
            return $resource(env.dataApi + 'organization/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('PublisherInstallations', function($resource, env) {
            return $resource(env.dataApi + 'organization/:id/installation', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('PublisherExtended', function($resource) {
            return $resource('/api/publisher/:key', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('PublisherSearch', function($resource) {
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
        .factory('PublisherCount', function($resource) {
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
        // Accepting participantId as param
        // return number of endorsed publishers
        /* .factory('PublisherEndorsedBy', function($resource) {
            return $resource('/api/publisher/endorsed-by/:participantId', null,
                {
                    'get': {
                        method: 'GET',
                        params: {participantId: '@participantId'},
                        isArray: false
                    }
                });
        }) */
        ;
})();
