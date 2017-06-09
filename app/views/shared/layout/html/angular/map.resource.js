'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('Regression', function ($resource, env) {
            return $resource(env.dataApiV2 + 'map/occurrence/regression', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('MapCapabilities', function ($resource, env) {
            return $resource('//api.gbif-dev.org/v2/map/occurrence/density/capabilities.json', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('OccurrenceBbox', function ($resource) {
            return $resource('//cdn.gbif.org/v1/map/density/tile.json?resolution=1&x=0&y=0&z=0', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        });

})();

