'use strict';

let angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('OccurrenceChartBasic', function($resource) {
            return $resource('/api/chart/occurrence/basic', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                    },
                }
            );
        });
})();
