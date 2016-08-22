'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('OccurrenceFilter', function ($rootScope) {
        var OCCURRENCE_FILTER_CHANGE= "occurrenceFilterChange";

        var filterChange = function(query) {
            $rootScope.$broadcast(OCCURRENCE_FILTER_CHANGE,
                {
                    info: query
                });
        };

        // note that we require $scope first
        // so that when the subscriber is destroyed you
        // don't create a closure over it, and the scope can clean up.
        var onFilterChange = function($scope, handler) {
            $scope.$on(OCCURRENCE_FILTER_CHANGE, function(event, message){
                handler(message.info);
            });
        };

        // other CoreReactorChannel events would go here.

        return {
            filterChange: filterChange,
            onFilterChange: onFilterChange
        };

    });