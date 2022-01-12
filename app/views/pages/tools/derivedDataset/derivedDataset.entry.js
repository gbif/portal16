'use strict';

require('./upload/derivedDatasetUpload.ctrl');
require('./about/derivedDatasetAbout.ctrl');
require('./derivedDataset.resource');
angular
    .module('portal')
    .controller('derivedDatasetCtrl', derivedDatasetCtrl);

/** @ngInject */
function derivedDatasetCtrl(User, $http, $scope, AUTH_EVENTS, USER_ROLES, $sessionStorage, $state, env) {
    var vm = this;
    vm.$state = $state;
    vm.uploads;
    vm.localePrefix = gb.locale === 'en' ? '/' : gb.locale + '/';

    vm.getToken = function() {
        return vm.token ? Promise.resolve() : $http({url: '/api/token', method: 'GET', headers: {'Authorization': 'Bearer ' + User.getAuthToken()}})
        .success(function(data, status) {
            vm.token = data.token;
        })
        .error(function(data, status) {
            
        });
    };
    vm.search = function() {
        // TODO add headers when backend is ready
        vm.getToken().then(function() {
            $http({
                method: 'get',
                url: env.dataApi + 'derivedDataset/user/' + vm.username,
                headers: {Authorization: 'Bearer ' + vm.token}
            }).then(function(res) {
                vm.uploads = res.data;
            }).catch(function(err) {
                vm.uploads = err.data;
            });
        });
    };
    function updateUser() {
        var user = $sessionStorage.user;
      //  vm.isRepoUser = User.hasRole(USER_ROLES.REPOSITORY_USER);
        vm.isLoggedIn = !!user;
        vm.username = user ? user.userName : undefined;
        if (vm.isLoggedIn) {
            vm.search();
        } else {
            vm.uploads = undefined;
        }
    }
    updateUser();
    $scope.$on(AUTH_EVENTS.USER_UPDATED, function() {
        updateUser();
    });
    $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function() {
        updateUser();
    });
    $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function() {
        updateUser();
    });

    $scope.$on(AUTH_EVENTS.USER_UPDATED, function() {
        updateUser();
    });

    // The user might have registered or edited a dataset, the list should be refreshed on state change
    $scope.$watch(function() {
        return $state.$current.name;
    }, function(newVal, oldVal) {
        if (newVal === 'derivedDataset' && oldVal !== 'derivedDataset') {
            vm.search();
        }
    });
}

module.exports = derivedDatasetCtrl;
