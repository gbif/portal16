'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('DegreeOfEstablishment', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/DegreeOfEstablishment/concepts/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('DegreeOfEstablishmentSearch', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/DegreeOfEstablishment/concepts', null, {
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

