'use strict';

require('./upload/derivedDatasetUpload.ctrl');
require('./about/derivedDatasetAbout.ctrl');
require('./derivedDataset.resource');
angular
    .module('portal')
    .controller('derivedDatasetCtrl', derivedDatasetCtrl);

/** @ngInject */
function derivedDatasetCtrl(User, $scope, AUTH_EVENTS, USER_ROLES, $sessionStorage, $state, DerivedDatasetSearch) {
    var vm = this;
    vm.$state = $state;
    vm.uploads;


    vm.search = function() {
        // TODO: replace this mock dataset key with userName
        // var datasetKey = 'b89a7f02-021d-4e7a-b19f-575d10578a6d';
        vm.uploads = DerivedDatasetSearch.query({username: vm.username}, function(res) {
            // console.log(res);
        }, function(err) {
            // console.log(err);
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
