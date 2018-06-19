'use strict';
var angular = require('angular');

require('../../../components/map/adhocMap/adhocMap.directive');

angular
    .module('portal')
    .controller('occurrenceMapCtrl', occurrenceMapCtrl);

/** @ngInject */
function occurrenceMapCtrl($state, $scope, OccurrenceSearch, OccurrenceFilter) {
    var vm = this;
    vm.occurrenceState = OccurrenceFilter.getOccurrenceData();
    vm.count = -1;
    vm.mapMenu = {
        show: false,
        occurrences: {}
    };

    var latestData = {};
    var search = function(query) {
        vm.count = -1;
        if (latestData.$cancelRequest) latestData.$cancelRequest();
        if (query.has_coordinate === 'false') {
            if (latestData.$cancelRequest) latestData.$cancelRequest();
            vm.count = 0;
            searchForSuspicious(query);
            return;
        }
        query = angular.copy(query);
        query.has_coordinate = angular.isDefined(query.has_coordinate) ? query.has_coordinate : 'true';
        query.limit = 0;
        latestData = OccurrenceSearch.query(query, function(data) {
            vm.count = data.count;
        }, function() {
            // TODO handle request error
        });
        searchForSuspicious(query);
    };

    var latestSuspiciousData = {};
    var searchForSuspicious = function(query) {
        if (latestSuspiciousData.$cancelRequest) latestSuspiciousData.$cancelRequest();
        vm.suspiciousCount = -1;
        if (query.has_geospatial_issue === 'false' || query.has_coordinate === 'false') {
            return;
        }
        query.has_geospatial_issue = 'true';
        latestSuspiciousData = OccurrenceSearch.query(query, function(data) {
            vm.suspiciousCount = data.count;
        }, function() {
            // TODO handle request error
        });
    };

    $scope.$watchCollection(function() {
        return $state.params;
    }, function() {
        search(vm.occurrenceState.query);
    });

    vm.mapEvents = {
        filterChange: function(filter) {
            $state.go($state.current, filter, {inherit: false, notify: true, reload: true});
        }
    };
}

module.exports = occurrenceMapCtrl;
