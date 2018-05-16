'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('userCtrl', userCtrl);

/** @ngInject */
function userCtrl(User, Page, $sessionStorage, $scope, AUTH_EVENTS, $state, $uibModal) {
    var vm = this;
    vm.$state = $state;
    Page.setTitle('Profile');

    var activeUser = User.loadActiveUser();
    if (activeUser) {
        activeUser.then(function() {
            vm.profile = $sessionStorage.user;
        }, function() {
            vm.profile = $sessionStorage.user;
        });
    } else {
        vm.profile = $sessionStorage.user;
    }

    vm.profile = $sessionStorage.user;
    vm.logout = function() {
        User.logout();
    };

    $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function() {
        vm.profile = $sessionStorage.user;
    });

    $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function() {
        vm.profile = $sessionStorage.user;
        if (typeof vm.profile.settings.has_read_gdpr_terms === 'undefined') {
           // alert('Our terms has changed due to the General Data Protection Regulation. Please read the new terms.');
           openGDPRmodal();
        }
    });

    $scope.$on(AUTH_EVENTS.USER_UPDATED, function() {
        vm.profile = $sessionStorage.user;
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

module.exports = userCtrl;
