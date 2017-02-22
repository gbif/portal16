'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('userMenu', userMenuDirective);

/** @ngInject */
function userMenuDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/shared/layout/partials/userMenu/userMenu.html',
        scope: {},
        replace: true,
        controller: userMenu,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function userMenu($scope, NAV_EVENTS, AUTH_EVENTS) {
        var vm = this;
        vm.isActive = false;

        $scope.$on(NAV_EVENTS.toggleUserMenu, function (event, data) {
            if (data.toggle) {
                vm.isActive = !vm.isActive;
            } else {
                vm.isActive = data.state;
            }
        });

        vm.close = function () {
            vm.isActive = false;
        };

        $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function () {
            vm.isActive = false;
        });

        $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function () {
            vm.isActive = false;
        });
    }
}

module.exports = userMenuDirective;


