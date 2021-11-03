'use strict';


angular
    .module('portal')
    .controller('myValidationsCtrl', myValidationsCtrl);

/** @ngInject */
function myValidationsCtrl(User, $http, $scope, AUTH_EVENTS, USER_ROLES, $sessionStorage, $stateParams, $state, env) {
    var vm = this;
    vm.$state = $state;
    vm.validations;
    vm.localePrefix = gb.locale === 'en' ? '/' : gb.locale + '/';
    function updatePaginationCounts() {
        vm.offset = parseInt($stateParams.offset) || 0;
        vm.maxSize = 5;
        vm.limit = parseInt($stateParams.limit) || 20;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
    }
    updatePaginationCounts();
    vm.getToken = function() {
        return vm.token ? Promise.resolve() : $http({url: '/api/token', method: 'GET', headers: {'Authorization': 'Bearer ' + User.getAuthToken()}})
        .success(function(data, status) {
            vm.token = data.token;
        })
        .error(function(data, status) {
           // handleWSError(data, status);
        });
    };
    vm.search = function() {
        // TODO add headers when backend is ready
        vm.getToken().then(function() {
            $http({
                method: 'get',
                url: env.dataApi + 'validation',
                headers: {Authorization: 'Bearer ' + vm.token},
                params: {limit: vm.limit, offset: vm.offset}
            }).then(function(res) {
                vm.validations = res.data;
            }).catch(function(err) {
                vm.validations = err.data;
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
            vm.validations = undefined;
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
        if (newVal === 'myValidations' && oldVal !== 'myValidations') {
            vm.search();
        }
    });

    vm.pageChanged = function() {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        $state.go($state.current, {limit: vm.limit, offset: vm.offset}, {inherit: true, notify: true, reload: true});
    };
}

module.exports = myValidationsCtrl;
