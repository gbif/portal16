'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('gdpr', gdprDirective);

/** @ngInject */
function gdprDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        templateUrl: '/api/template/gdpr.html?v=' + BUILD_VERSION,
        scope: {},
        replace: true,
        controller: gdpr,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function gdpr($scope, $sessionStorage, AUTH_EVENTS, User, $uibModal, $location) {
    var vm = this;
    $scope.$on(AUTH_EVENTS.USER_UPDATED, function() {
        vm.profile = $sessionStorage.user;
        if (!$sessionStorage.has_seen_gdpr_popup && vm.profile && typeof vm.profile.settings.has_read_gdpr_terms === 'undefined') {
            $sessionStorage.has_seen_gdpr_popup = true;
            openGDPRmodal();
         }
    });

    $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function() {
        vm.profile = $sessionStorage.user;
        if (!$sessionStorage.has_seen_gdpr_popup && vm.profile && typeof vm.profile.settings.has_read_gdpr_terms === 'undefined') {
            $sessionStorage.has_seen_gdpr_popup = true;
            openGDPRmodal();
         }
    });

    function openGDPRmodal() {
        var modalInstance = $uibModal.open({
            animation: true,
            backdrop: 'static',
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
            delete $sessionStorage.has_seen_gdpr_popup;
            User.logout('/');
        });
}
}
}

angular.module('portal').controller('gdprModalCtrl', function($uibModalInstance) {
    var $ctrl = this;
    $ctrl.ok = function() {
        $uibModalInstance.close();
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});

module.exports = gdprDirective;

