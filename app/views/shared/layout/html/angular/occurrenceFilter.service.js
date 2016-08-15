'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('OccurrenceFilter', function ($stateParams) {
        return {
            getQuery: function() {
                return $stateParams
            }
        };
    });