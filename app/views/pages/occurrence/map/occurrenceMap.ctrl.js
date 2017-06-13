'use strict';
var angular = require('angular'),
    _ = require('lodash');

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
    var search = function (query) {
        query = angular.copy(query);
        query.hasCoordinate = 'true';
        query.limit = 0;
        vm.count = -1;
        if (latestData.$cancelRequest) latestData.$cancelRequest();
        latestData = OccurrenceSearch.query(query, function (data) {
            vm.count = data.count;
        }, function () {
            //TODO handle request error
        });
    };

    $scope.$watchCollection(function () {
        return $state.params
    }, function (newValue) {
        search(vm.occurrenceState.query);
    });

    vm.mapEvents = {
        filterChange: function(filter){
            $state.go($state.current, filter, {inherit: false, notify: true, reload: true});
        }
    };

}

module.exports = occurrenceMapCtrl;
