'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('OccurrenceFrequentTaxa', function ($resource) {
            return $resource('/api/chart/occurrence/frequentTaxa', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        });
})();
