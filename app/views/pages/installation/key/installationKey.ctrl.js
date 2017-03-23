'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('installationKeyCtrl', installationKeyCtrl);

/** @ngInject */
function installationKeyCtrl($state, $stateParams, InstallationDatasets) {
    var vm = this;
    vm.limit = 5;
    vm.servedDatasets = {};
    vm.maxSize = 5;
    vm.limit = 5;
    vm.key = gb.installationKey || $stateParams.key;

    vm.getDatasets = function () {
        InstallationDatasets.get({id: vm.key, limit: vm.limit, offset: vm.offset},
            function (response) {
                vm.servedDatasets = response;
            },
            function () {
                //TODO handle errors
            }
        );
    };

    vm.setPageNumbers = function () {
        vm.offset = $stateParams.offset || 0;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
        vm.getDatasets();
    };
    vm.setPageNumbers();

    vm.pageChanged = function () {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        var offset = vm.offset == 0 ? undefined : vm.offset;
        $state.go($state.current, {limit: vm.limit, offset: offset, '#': 'servedDatasets'}, {inherit: true, notify: false, reload: true});
        vm.getDatasets();
    };

}


module.exports = installationKeyCtrl;
