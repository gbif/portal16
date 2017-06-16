'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('datasetConstituentsCtrl', datasetConstituentsCtrl);

/** @ngInject */
function datasetConstituentsCtrl($stateParams, $state, DatasetConstituents, hotkeys) {
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
        var constituents = DatasetConstituents.get({key: vm.key, limit: vm.limit, offset: vm.offset});
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
        vm.offset = (vm.currentPage - 1) * vm.limit;
        $state.go($state.current, {limit: vm.limit, offset: vm.offset}, {inherit: true, notify: true, reload: false});
    };

    hotkeys.add({
        combo: 'alt+right',
        description: 'Next',
        callback: function () {
            if (vm.offset + vm.limit < vm.constituents.count) {
                vm.currentPage += 1;
                vm.pageChanged();
            }
        }
    });
    hotkeys.add({
        combo: 'alt+left',
        description: 'Previous',
        callback: function () {
            if (vm.offset > 0) {
                vm.currentPage -= 1;
                vm.pageChanged();
            }
        }
    });

}

module.exports = datasetConstituentsCtrl;