'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('RedlistSpecies', function($resource, token) {
            return $resource('/api/redlist/:name', null, {
                    'query': {
                        method: 'GET',
                        params: {
                            token: token.iucn
                        },
                        isArray: false
                    }
                }
            );
        });
})();

