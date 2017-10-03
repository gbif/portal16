'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('Node', function ($resource, env) {
            return $resource(env.dataApi + 'node/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('NodeEndorsedPublishers', function ($resource, env) {
            return $resource(env.dataApi + 'node/:id/organization', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('NodeCountry', function ($resource, env) {
            return $resource(env.dataApi + 'node/country/:countryCode', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('NodeDatasets', function ($resource, env) {
            return $resource(env.dataApi + 'node/:id/dataset', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('Participant', function ($resource) {
            return $resource('/api/participant/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
    ;
})();

