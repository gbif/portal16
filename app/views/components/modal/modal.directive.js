'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('gbModal', modalDirective);

/** @ngInject */
function modalDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/modal/modal.html?v=' + BUILD_VERSION,
        scope: {
            onDismiss: '&'
        },
        replace: true,
        controller: modal,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function modal($timeout) {
        var vm = this;
        $timeout(function() {
vm.fadeIn = true;
}, 0);
        vm.dismiss = function() {
            if (typeof vm.onDismiss == 'function') {
                vm.fadeIn = false;
                vm.onDismiss();
            }
        };
    }
}

module.exports = modalDirective;

