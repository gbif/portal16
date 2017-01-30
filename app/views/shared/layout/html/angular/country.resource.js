'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('CountryDataDigest', function ($resource) {
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
        })
    ;
})();

