var angular = require('angular');
(function () {
    'use strict';

    angular
        .module('portal')
        .factory('Occurrence', function($resource) {
            return $resource('http://api.gbif.org/v1/occurrence/:id', null, {
                'query': {
                    method: 'GET',
                    isArray: false
                }
            });
        });
})();