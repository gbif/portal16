'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('RedlistSpecies', function ($resource, token) {
            return $resource('http://apiv3.iucnredlist.org/api/v3/species/:name', null, {
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

