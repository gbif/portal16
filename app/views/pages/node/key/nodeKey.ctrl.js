'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('nodeKeyCtrl', nodeKeyCtrl);

/** @ngInject */
function nodeKeyCtrl(NodeEndorsedPublishers, NodeDatasets, $stateParams, $location, $scope, $window) {
    var vm = this;
    vm.limit = 5;
    vm.endorsed = {};
    vm.datasets = {};
    vm.maxSize = 5;
    vm.limit = 5;


    vm.getEndorsed = function () {
        NodeEndorsedPublishers.get({id: vm.key, limit: vm.limit, offset: vm.offset_endorsed},
            function (response) {
                vm.endorsed = response;
            },
            function () {
                //TODO handle errors
            }
        );
    };

    vm.getDatasets = function () {
        NodeDatasets.get({id: vm.key, limit: vm.limit, offset: vm.currentPage_datasets},
            function (response) {
                vm.datasets = response;
            },
            function () {
                //TODO handle errors
            }
        );
    };

    vm.setKey = function (key, offset_endorsed, offset_datasets) {
        vm.key = key;
        vm.offset_endorsed = offset_endorsed;
        vm.currentPage_endorsed = Math.floor(vm.offset_endorsed / vm.limit) + 1;

        vm.offset_datasets = offset_datasets;
        vm.currentPage_datasets = Math.floor(vm.offset_datasets / vm.limit) + 1;
        vm.getDatasets();
        vm.getEndorsed();
    };

    vm.pageChanged_endorsed = function () {
        vm.offset_endorsed = (vm.currentPage_endorsed - 1) * vm.limit;
        $scope.$watchCollection($location.search('offset_endorsed', vm.offset_endorsed), function () {
            $window.location.reload();
        });
        //$state.go($state.current, {limit: vm.limit, offset_endorsed: vm.offset_endorsed}, {inherit: true, notify: true, reload: true});
    };
    vm.pageChanged_datasets = function () {
        vm.offset_datasets = (vm.currentPage_datasets - 1) * vm.limit;
        $scope.$watchCollection($location.search('offset_datasets', vm.offset_datasets), function () {
            $window.location.reload();
        });
        //$state.go($state.current, {limit: vm.limit, offset_datasets: vm.offset_datasets}, {inherit: true, notify: true, reload: true});
    };

}


module.exports = nodeKeyCtrl;
