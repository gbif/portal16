'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('Installation', function($resource, env) {
            return $resource(env.dataApi + 'installation/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('InstallationExtended', function($resource) {
            return $resource('/api/installation/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('InstallationDatasets', function($resource, env) {
            return $resource(env.dataApi + 'installation/:id/dataset', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        });
})();

