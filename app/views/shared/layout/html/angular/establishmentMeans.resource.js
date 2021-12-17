'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('EstablishmentMeans', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/EstablishmentMeans/concepts/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('EstablishmentMeansSearch', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/EstablishmentMeans/concepts', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
    ;
})();

