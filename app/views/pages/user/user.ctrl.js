'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('userCtrl', userCtrl);

/** @ngInject */
function userCtrl(User, Page, $sessionStorage, $scope, AUTH_EVENTS, $state, $translate) {
    var vm = this;
    vm.$state = $state;
    $translate('profile.profile').then(function(title) {
        Page.setTitle(title);
    });
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
    });

    $scope.$on(AUTH_EVENTS.USER_UPDATED, function() {
        vm.profile = $sessionStorage.user;
    });
}

module.exports = userCtrl;
