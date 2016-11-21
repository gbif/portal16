'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('OccurrenceBbox', function ($resource, $http) {
            return $resource('//cdn.gbif.org/v1/map/density/tile.json?resolution=1&x=0&y=0&z=0', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        });

})();

