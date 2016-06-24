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
    .controller('datasetTableCtrl', datasetTableCtrl);

/** @ngInject */
function datasetTableCtrl(results, $stateParams, $state) {
    var vm = this,
        offset = parseInt($stateParams.offset) || 0;

    vm.count = results.count;
    vm.results = results.results;

    //pagination
    vm.maxSize = 5;
    vm.limit = parseInt($stateParams.limit) || 20;
    vm.totalItems = results.count;
    vm.currentPage = Math.floor(offset / vm.limit) + 1;

    vm.pageChanged = function() {
        $stateParams.offset =  (vm.currentPage-1) * vm.limit;
        $state.go($state.current, $stateParams, {reload: true});
    };
}

module.exports = datasetTableCtrl;

