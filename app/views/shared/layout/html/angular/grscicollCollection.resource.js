'use strict';

var angular = require('angular');

(function() {
    angular
        .module('portal')
        .factory('CollectionKey', function($resource, env) {
            return $resource(env.dataApi + 'grscicoll/collection/:key', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('CollectionSearch', function($resource, env) {
            return $resource(env.dataApi + 'grscicoll/collection', null, {
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
