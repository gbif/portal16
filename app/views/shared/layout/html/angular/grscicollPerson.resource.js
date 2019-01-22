'use strict';

var angular = require('angular');

(function() {
    angular
        .module('portal')
        .factory('PersonKey', function($resource, env) {
            return $resource(env.dataApi + 'grbio/person/:key', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('PersonSearch', function($resource, env) {
            return $resource(env.dataApi + 'grbio/person', null, {
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
