'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('datasetConstituentsCtrl', datasetConstituentsCtrl);

/** @ngInject */
function datasetConstituentsCtrl($stateParams, $state, DatasetConstituents) {
    var vm = this;
    vm.key = $stateParams.key;

    function updatePaginationCounts() {
        vm.offset = parseInt($stateParams.offset) || 0;
        vm.maxSize = 5;
        vm.limit = parseInt($stateParams.limit) || 20;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
    }

    updatePaginationCounts();

    vm.getConstituents = function () {
        vm.loadingDownloads = true;
        vm.failedToLoadDownloads = false;
        var constituents = DatasetConstituents.get(vm.key, {params: {limit: vm.limit, offset: vm.offset}});
        constituents.$promise.then(function (response) {
            vm.loadingDownloads = false;
            vm.constituents = response;
        }, function () {
            vm.loadingDownloads = false;
            vm.failedToLoadDownloads = true;
        });
    };
    vm.getConstituents();

    vm.pageChanged = function () {
    console.log('page');
        vm.offset = (vm.currentPage - 1) * vm.limit;
        $state.go($state.current, {limit: vm.limit, offset: vm.offset}, {inherit: true, notify: true, reload: true});
    };

    vm.openHelpdesk = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true, type: 'QUESTION'});
    };

}

module.exports = datasetConstituentsCtrl;