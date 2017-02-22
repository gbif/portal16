'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('userCtrl', userCtrl);

/** @ngInject */
function userCtrl(User, $cookies, $sessionStorage, $window, $scope, AUTH_EVENTS) {
    var vm = this;

    vm.loggedIn = !!$cookies.get('userSession');
    var activeUser = User.loadActiveUser();
    if (activeUser) {
        activeUser.then(function(){
            vm.loggedIn = true;
        }, function(){
            vm.loggedIn = false;
        });
    } else {
        vm.loggedIn = false;
    }

    vm.user = $sessionStorage.user;
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
        vm.loggedIn = false;
        vm.user = $sessionStorage.user;
    });

    $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function () {
        vm.loggedIn = true;
        vm.user = $sessionStorage.user;
    });
}

module.exports = userCtrl;
