'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('fab', fabDirective);

/** @ngInject */
function fabDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/fab/fab.html?v=' + BUILD_VERSION,
        scope: {},
        controller: fab,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function fab() {
        var vm = this;
        vm.isExpanded = false;
    }
}

module.exports = fabDirective;
