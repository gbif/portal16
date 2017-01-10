'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('CitesApi', function ($resource, token) {
            return $resource('//api.speciesplus.net/api/v1/taxon_concepts.json', null, {
                    'query': {
                        method: 'GET',
                        headers: {
                            'X-Authentication-Token': token.cites
                        },
                        params: {
                            name: ':name'
                        },
                        isArray: false
                    }
                }
            );
        });

})();
