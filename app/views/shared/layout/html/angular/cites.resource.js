'use strict';

let angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('CitesApi', function($resource) {
            return $resource('/api/cites/:kingdom/:name', null, {}
            );
        });
})();
