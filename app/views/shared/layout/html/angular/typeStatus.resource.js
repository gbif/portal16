'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('TypeStatus', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/TypeStatus/concepts/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('TypeStatusSearch', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/TypeStatus/concepts', null, {
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

