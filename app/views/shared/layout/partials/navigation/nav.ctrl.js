'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('navCtrl', navCtrl);

/** @ngInject */
function navCtrl($http, $location, $rootScope, NAV_EVENTS, AUTH_EVENTS, $sessionStorage, $scope, $state, User) {
    var vm = this;
    var toggleGroup = [
        NAV_EVENTS.toggleSearch,
        NAV_EVENTS.toggleFeedback,
        NAV_EVENTS.toggleNotifications,
        NAV_EVENTS.toggleUserMenu
    ];

    vm.openMenu = function(navEvent){
        toggleGroup.forEach(function(e){
            if (e === navEvent) {
                $rootScope.$broadcast(e, {state: true});
            } else {
                $rootScope.$broadcast(e, {state: false});
            }
        });
    };

    vm.toggleNotifications = function () {
        vm.openMenu(NAV_EVENTS.toggleNotifications);
    };

    vm.toggleFeedback = function () {
        vm.openMenu(NAV_EVENTS.toggleFeedback);
    };

    vm.toggleSearch = function () {
        vm.openMenu(NAV_EVENTS.toggleSearch);
    };

    vm.toggleUserMenu = function () {
        console.log(4);
        if (!$state.includes('user')) {
            vm.openMenu(NAV_EVENTS.toggleUserMenu);
        }
    };

    vm.getIssues = function () {
        $http.get('/api/feedback/issues?item=' + encodeURIComponent($location.path()), {})
            .then(function (response) {
                vm.issuesCount = response.data.total_count;
            }, function () {
                vm.issuesCount = undefined;
                //TODO mark as failure or simply hide
            });
    };
    vm.getIssues();

    function updateUser() {
        vm.loginGreeting = _.get($sessionStorage.user, 'userName', 'Login');
    }
    updateUser();
    $scope.$on(AUTH_EVENTS.USER_UPDATED, function () {
        updateUser();
    });
    $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function () {
        updateUser();
    });
    $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function () {
        updateUser();
    });

}

module.exports = navCtrl;
