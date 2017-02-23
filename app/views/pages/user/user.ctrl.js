'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('userCtrl', userCtrl);

/** @ngInject */
function userCtrl(User, $sessionStorage, $window, $scope, AUTH_EVENTS) {
    var vm = this;

    var activeUser = User.loadActiveUser();
    if (activeUser) {
        activeUser.then(function(){
            vm.profile = $sessionStorage.user;
        }, function(){
            vm.profile = $sessionStorage.user;
        });
    } else {
        vm.profile = $sessionStorage.user;
    }

    vm.profile = $sessionStorage.user;
    vm.logout = function () {
        var logout = User.logout();
        logout.then(function () {
            $window.location.reload();
        }, function () {
            //TODO the client should also be able to logout, but the token might not have been deleted from the server. that seems less interesting for the user
        });
    };

    $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function () {
        $window.location.reload();
        vm.profile = $sessionStorage.user;
    });

    $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function () {
        vm.profile = $sessionStorage.user;
    });

    $scope.$on(AUTH_EVENTS.USER_UPDATED, function () {
        vm.profile = $sessionStorage.user;
    });
}

module.exports = userCtrl;
