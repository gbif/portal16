'use strict';
var angular = require('angular'),
    programmeValidate = require('./programmeValidate');

angular
    .module('portal')
    .controller('programmeCtrl', programmeCtrl);

/** @ngInject */
function programmeCtrl(CmsNode, $log) {
    var vm = this;
    vm.getNodeData = function () {
        CmsNode.get({type: vm.nodeType, id: vm.nodeId}).$promise.then(function (response) {
            vm.node = response.data[0];

            // related project column integrity for BID
            if (vm.node.id == '82243' && !programmeValidate(vm.node.relatedProjects)) {
                $log.info('Projects lack grantType.')
            }
        }, function (error) {
            return error;
        });
    };

    vm.sortField = 'title';
    vm.sortReverse = false;

}

module.exports = programmeCtrl;