'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('programmeCtrl', programmeCtrl);

/** @ngInject */
function programmeCtrl(CmsNode) {
    var vm = this;
    vm.getNodeData = function() {
        CmsNode.get({type: vm.nodeType, id: vm.nodeId}).$promise.then(function(response){
            vm.node = response.results[0];
        }, function(error){
            return error;
        });
    };

    vm.sortField = 'title';
    vm.sortReverse = false;
    
}

module.exports = programmeCtrl;

