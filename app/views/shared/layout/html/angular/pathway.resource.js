'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('Pathway', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/Pathway/concepts/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('PathwaySearch', function($resource, env) {
            return $resource(env.dataApi + 'vocabularies/Pathway/concepts', null, {
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

