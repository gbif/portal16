'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('userMenu', userMenuDirective);

/** @ngInject */
function userMenuDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/shared/layout/partials/userMenu/userMenu.html?v=' + BUILD_VERSION,
        scope: {},
        replace: true,
        controller: userMenu,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function userMenu($scope, NAV_EVENTS, AUTH_EVENTS, $sessionStorage, $uibModal, User) {
        var vm = this;
        vm.isActive = false;

        $scope.$on(NAV_EVENTS.toggleUserMenu, function(event, data) {
            if (data.toggle) {
                vm.isActive = !vm.isActive;
            } else {
                vm.isActive = data.state;
            }
        });

        vm.close = function() {
            vm.isActive = false;
        };

        $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function() {
            vm.isActive = false;
        });

        $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function() {
            vm.isActive = false;
            vm.profile = $sessionStorage.user;
        if (typeof vm.profile.settings.has_read_gdpr_terms === 'undefined') {
           // alert('Our terms has changed due to the General Data Protection Regulation. Please read the new terms.');
           openGDPRmodal();
        }
        });

        function openGDPRmodal() {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'gdprModal.html',
                controller: 'gdprModalCtrl',
                controllerAs: '$ctrl'
            });
            modalInstance.result.then(function(res) {
                vm.profile.settings.has_read_gdpr_terms = true;
                User.update(vm.profile);
            }, function() {
                delete vm.profile.settings.has_read_gdpr_terms;
                User.update(vm.profile);
                // user clicked cancel
            });
    }
    }
}

angular.module('portal').controller('gdprModalCtrl', function($uibModalInstance) {
    var $ctrl = this;
    // $ctrl.username;
    // $ctrl.password;
    // $ctrl.email;

    $ctrl.ok = function() {
        $uibModalInstance.close();
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});

module.exports = userMenuDirective;


