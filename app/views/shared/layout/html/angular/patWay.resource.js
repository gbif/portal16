'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('PathWay', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/PathWay/concepts/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('PathWaySearch', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/PathWay/concepts', null, {
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

