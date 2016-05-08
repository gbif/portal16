'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('OccurrenceFilter', function ($stateParams) {
        var that = this;
        that.query = angular.copy($stateParams);

        return {
            getQuery: function(){return that.query;},
            query: that.query
        };
    });