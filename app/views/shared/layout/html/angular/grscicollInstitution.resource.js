'use strict';

var angular = require('angular');

(function() {
    angular
        .module('portal')
        .factory('InstitutionKey', function($resource, env) {
            return $resource(env.dataApi + 'grscicoll/institution/:key', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('InstitutionSearch', function($resource, env) {
            return $resource(env.dataApi + 'grscicoll/institution', null, {
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
