'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('fab', fabDirective);

/** @ngInject */
function fabDirective() {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/fab/fab.html',
        scope: {
            type: '=',
        },
        controller: fab,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function fab() {
        var vm = this;
    }
}

module.exports = fabDirective;
