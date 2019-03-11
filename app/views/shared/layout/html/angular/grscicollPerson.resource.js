'use strict';

var angular = require('angular');

(function() {
    angular
        .module('portal')
        .factory('PersonKey', function($resource, env) {
            return $resource(env.dataApi + 'grscicoll/person/:key', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('PersonSearch', function($resource, env) {
            return $resource(env.dataApi + 'grscicoll/person', null, {
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
