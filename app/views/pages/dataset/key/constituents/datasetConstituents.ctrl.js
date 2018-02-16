'use strict';

let angular = require('angular'),
_ = require('lodash');

angular
    .module('portal')
    .controller('datasetConstituentsCtrl', datasetConstituentsCtrl);

/** @ngInject */
function datasetConstituentsCtrl($stateParams, $state, DatasetConstituents, hotkeys, constantKeys, env, $http, SpeciesConstituentSearch) {
    let vm = this;
    vm.key = $stateParams.key;
    vm.backboneKey = constantKeys.dataset.backbone;
    vm.backboneNetworkKey = constantKeys.network.backboneNetwork;
    vm.dataApi = env.dataApi;
    vm.isBackbone = (vm.key === vm.backboneKey);
    vm.endOfRecords = false;
    vm.currentPage = 1;


    function updatePaginationCounts() {
        vm.offset = parseInt($stateParams.offset) || 0;
        vm.maxSize = 5;
        vm.limit = parseInt($stateParams.limit) || 20;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
    }

    updatePaginationCounts();

    vm.totalItems = function() {
        let total = vm.offset + vm.limit;
        if (!vm.endOfRecords) {
            total += vm.limit;
        }
        return total;
    };

    vm.getConstituents = function() {
        vm.loadingDownloads = true;
        vm.failedToLoadDownloads = false;
         if (vm.key !== vm.backboneKey) {
             DatasetConstituents.get({key: vm.key, limit: vm.limit, offset: vm.offset}).$promise.then(function(response) {
                 vm.loadingDownloads = false;
                 vm.constituents = response;
             }, function() {
                 vm.loadingDownloads = false;
                 vm.failedToLoadDownloads = true;
             });
         } else {
             SpeciesConstituentSearch.get({datasetKey: vm.backboneKey, limit: vm.limit, offset: vm.offset}).$promise
                 .then(function(response) {
                     vm.loadingDownloads = false;
                     vm.constituents = response;
                 }, function() {
                     vm.loadingDownloads = false;
                     vm.failedToLoadDownloads = true;
                 });
         }
    };
    vm.getConstituents();

    vm.hasData = function() {
        return (vm.constituents) && typeof vm.constituents.endOfRecords !== 'undefined';
    };

    vm.pageChanged = function() {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        $state.go($state.current, {limit: vm.limit, offset: vm.offset}, {inherit: true, notify: true, reload: false});
    };

    hotkeys.add({
        combo: 'alt+right',
        description: 'Next',
        callback: function() {
            if (vm.offset + vm.limit < vm.constituents.count) {
                vm.currentPage += 1;
                vm.pageChanged();
            }
        },
    });
    hotkeys.add({
        combo: 'alt+left',
        description: 'Previous',
        callback: function() {
            if (vm.offset > 0) {
                vm.currentPage -= 1;
                vm.pageChanged();
            }
        },
    });
}

module.exports = datasetConstituentsCtrl;
