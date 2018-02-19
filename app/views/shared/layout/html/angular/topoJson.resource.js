'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('WorldRobinson', function($resource) {
            return $resource('/api/topojson/world-robinson', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('WorldTopoJson', function($resource) {
            return $resource('/api/topojson/world', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
    ;
})();

