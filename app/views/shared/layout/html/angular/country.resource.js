'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
/*         .factory('CountryDataDigest', function($resource) {
            return $resource('/api/country/digest/:iso2', null,
                {
                    'get': {
                        method: 'GET',
                        params: {
                            iso2: '@iso2'
                        },
                        isArray: true
                    }
                });
        }) */
        .factory('Country', function($resource) {
            return $resource('/api/country/:key', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        });
})();

