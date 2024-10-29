'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('Sex', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/Sex/concepts/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SexSearch', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/Sex/concepts', null, {
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

