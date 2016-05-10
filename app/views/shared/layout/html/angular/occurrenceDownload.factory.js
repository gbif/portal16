'use strict';

var angular = require('angular');

angular
    .module('portal')
    // A GBIF Registry service that exposes /organization access point.
    .factory('DownloadEventsService', ['$resource', function($resource) {
        return $resource('http://api.gbif.org/v1/occurrence/download/dataset/:uuid');
    }]);
