'use strict';

let angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('Regression', function($resource, env) {
            return $resource(env.dataApiV2 + 'map/occurrence/regression', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true,
                    },
                }
            );
        })
        .factory('MapCapabilities', function($resource, env) {
            return $resource(env.mapCapabilities, null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                    },
                }
            );
        });
})();

