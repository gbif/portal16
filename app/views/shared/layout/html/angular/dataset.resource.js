'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('Dataset', function($resource, env) {
            return $resource(env.dataApi + 'dataset/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('OccurrenceSearch', function($resource, env) {
            return $resource(env.dataApi + 'dataset/search', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
    ;

})();

