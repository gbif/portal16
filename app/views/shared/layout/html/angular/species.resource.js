'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('Species', function($resource, env) {
            return $resource(env.dataApi + 'species/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesSuggest', function($resource, env) {
            return $resource(env.dataApi + 'species/suggest', null, {
                    'query': {
                        method: 'GET',
                        isArray: true
                    }
                }
            );
        });

})();

