'use strict';

var angular = require('angular');

(function() {
    angular
        .module('portal')
        .factory('CitesApi', function($resource) {
            return $resource('/api/cites/:kingdom/:name', null, {}
            );
        });
})();
