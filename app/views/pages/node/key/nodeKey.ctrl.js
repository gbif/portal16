'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('nodeKeyCtrl', nodeKeyCtrl);

/** @ngInject */
function nodeKeyCtrl(NodeEndorsedPublishers, NodeDatasets) {
    var vm = this;
    vm.limit = 5;
    vm.endorsed = {};
    vm.datasets = {};

    vm.getEndorsed = function() {
        NodeEndorsedPublishers.get({id: '0909d601-bda2-42df-9e63-a6d51847ebce', limit: vm.limit},
            function(response){
                vm.endorsed = response;
            },
            function(){
                //TODO handle errors
            }
        );
    };
    vm.getEndorsed();

    vm.getDatasets = function() {
        NodeDatasets.get({id: '0909d601-bda2-42df-9e63-a6d51847ebce', limit: vm.limit},
            function(response){
                vm.datasets = response;
            },
            function(){
                //TODO handle errors
            }
        );
    };
    vm.getDatasets();

    //vm.endorsedPageChanged = function() {
    //    vm.offset = (vm.currentPage - 1) * vm.limit;
    //    $location.hash('datasets');
    //    $scope.$watchCollection($location.search('offset', vm.offset), function () {
    //        $window.location.reload();
    //    })
    //};

    //vm.setInitials = function(offset, limit, key) {
    //    vm.offset = offset || 0;
    //    vm.limit = limit;
    //    vm.key = key;
    //    vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
    //};

}


module.exports = nodeKeyCtrl;
