'use strict';

require('./upload/dataRepositoryUpload.ctrl');
require('./about/dataRepositoryAbout.ctrl');
require('./upload/key/dataRepositoryKey.ctrl');
require('./dataPackage.resource');

let _ = require('lodash');

angular
    .module('portal')
    .controller('dataRepositoryCtrl', dataRepositoryCtrl);

/** @ngInject */
function dataRepositoryCtrl(User, $scope, AUTH_EVENTS, USER_ROLES, $sessionStorage, $state, DataPackageSearch) {
    let vm = this;
    vm.$state = $state;
    vm.myUploads = false;
    vm.uploads;

    function updateUser() {
        let user = $sessionStorage.user;
        vm.isRepoUser = User.hasRole(USER_ROLES.REPOSITORY_USER);
        vm.username = user ? user.userName : undefined;
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

    vm.search = function() {
        let apiQuery = {q: vm.q};
        if (vm.myUploads && vm.username) {
            apiQuery.user = vm.username;
        }
        vm.uploads = DataPackageSearch.query(apiQuery, function(res) {
            // console.log(res);
        }, function(err) {
            // console.log(err);
        });
    };
    vm.search();

    $scope.$on(AUTH_EVENTS.USER_UPDATED, function() {
        updateUser();
    });
}

module.exports = dataRepositoryCtrl;
