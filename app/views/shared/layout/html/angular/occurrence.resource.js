'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('Occurrence', function($resource, env) {
            return $resource(env.dataApi + 'occurrence/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('OccurrenceVerbatim', function($resource, env) {
            return $resource(env.dataApi + 'occurrence/:id/verbatim', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('OccurrenceSearch', function($resource, env) {
            return $resource(env.dataApi + 'occurrence/search', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        });

})();

