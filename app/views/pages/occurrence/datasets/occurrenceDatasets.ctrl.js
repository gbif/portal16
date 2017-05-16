'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceDatasetsCtrl', occurrenceDatasetsCtrl);

/** @ngInject */
function occurrenceDatasetsCtrl($scope, OccurrenceFilter, OccurrenceDatasetSearch) {
    var vm = this;
    vm.state = OccurrenceFilter.getOccurrenceData();
    vm.datasets = {};
    vm.limit = 20;
    vm.offset = 0;
    vm.endOfRecords = false;
    vm.currentPage = 1;

    vm.totalItems = function() {
        var total = vm.offset + vm.limit;
        if (!vm.endOfRecords) {
            total += vm.limit;
        }
        return total;
    };

    var search = function () {
    var query = angular.copy(vm.state.query);
        query.offset = vm.offset;
        query.limit = vm.limit;
        vm.endOfRecords = true;
        if (vm.datasets.$cancelRequest) vm.datasets.$cancelRequest();
        vm.datasets = OccurrenceDatasetSearch.query(query, function (data) {
            vm.offset = data.offset;
            vm.endOfRecords = data.endOfRecords;
        }, function () {
            //TODO handle request error
        });
    };
    search();

    vm.pageChanged = function () {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
        search();
        window.scrollTo(0, 0);
    };

    $scope.$watch(function () {
        return vm.state.table
    }, function () {
        vm.offset = 0;
        vm.currentPage = 1;
        vm.endOfRecords = false;
        search(vm.state.query);
    });

    vm.hasData = function () {
        return typeof vm.datasets.endOfRecords !== 'undefined';
    };

    vm.hasTableData = function () {
        return typeof vm.datasets.endOfRecords !== 'undefined';
    }

}

module.exports = occurrenceDatasetsCtrl;
