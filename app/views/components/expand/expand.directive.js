'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('expand', expandDirective);

/** @ngInject */
function expandDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/expand/expand.html',
        scope: {
            expandText: '=',
            collapseText: '=',
            expandModel: '='
        },
        controller: expand,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function expand() {
        var vm = this;
        //vm.expandModel = vm.expandModel || {};
        vm.expandText = vm.expandText || vm.expandModel.expandText;
        vm.collapseText = vm.collapseText || vm.expandModel.collapseText;
        vm.isExpanded = false;
        vm.toggle = function() {
            vm.isExpanded = !vm.isExpanded;
            if (vm.expandModel) {
                vm.expandModel.isExpanded = vm.isExpanded;
            }
        };
    }
}

module.exports = expandDirective;
