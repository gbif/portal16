'use strict';

var angular = require('angular');

(function() {
    angular
        .module('portal')
        .factory('InstitutionKey', function($resource, env) {
            return $resource(env.dataApi + 'grbio/institution/:key', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('InstitutionSearch', function($resource, env) {
            return $resource(env.dataApi + 'grbio/institution', null, {
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
