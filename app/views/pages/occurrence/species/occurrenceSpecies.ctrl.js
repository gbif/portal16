/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceSpeciesCtrl', occurrenceSpeciesCtrl);

/** @ngInject */
function occurrenceSpeciesCtrl($scope, OccurrenceFilter, OccurrenceTaxonSearch) {
    var vm = this;
    vm.state = OccurrenceFilter.getOccurrenceData();
    vm.checklist = {};
    vm.limit = 100;
    vm.offset = 0;
    vm.endOfRecords = false;
    vm.currentPage = 1;

    vm.totalItems = function() {
        var total = vm.offset + vm.limit;
        if (!vm.endOfRecords) {
            total += 100;
        }
        return total;
    };

    var search = function () {
    var query = angular.copy(vm.state.query);
        query.offset = vm.offset;
        query.limit = vm.limit;
        vm.endOfRecords = true;
        if (vm.checklist.$cancelRequest) vm.checklist.$cancelRequest();
        vm.checklist = OccurrenceTaxonSearch.query(query, function (data) {
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
        return typeof vm.checklist.endOfRecords !== 'undefined';
    };

    vm.hasTableData = function () {
        return typeof vm.checklist.endOfRecords !== 'undefined';
    }

}

module.exports = occurrenceSpeciesCtrl;
