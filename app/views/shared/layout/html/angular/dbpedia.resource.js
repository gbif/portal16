'use strict';

let angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('DbPedia', function($resource) {
            return $resource('http://dbpedia.org/data/:name.json', null, {
                    'query': {
                        method: 'GET',
                        params: {},
                        isArray: false,
                    },
                }
            );
        });
})();

