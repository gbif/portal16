(function () {
    'use strict';
    var angular = require('angular'),
        _ = require('lodash');

    angular
        .module('portal')
        .constant('AUTH_EVENTS', {
            USER_UPDATED: 'USER_UPDATED',
            LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
            LOGOUT_FAILED: 'LOGOUT_FAILED',
            LOGIN_SUCCESS: 'LOGIN_SUCCESS',
            LOGIN_FAILURE: 'LOGIN_FAILURE'
        });

    angular
        .module('portal')
        .service('User', function ($http, $sessionStorage, $rootScope, AUTH_EVENTS, $cookies, $location, $window) {
                var that = this;

                that.loadActiveUser = function () {
                    var activeUser = $http.get('/api/user');
                    activeUser.then(function (response) {
                        $sessionStorage.user = response.data;
                        $rootScope.$broadcast(AUTH_EVENTS.USER_UPDATED);
                    }, function () {
                        delete $sessionStorage.user;
                        $rootScope.$broadcast(AUTH_EVENTS.USER_UPDATED);
                    });
                    return activeUser;
                };

                that.loadStorageUser = function () {
                    if (!$sessionStorage.user) {
                        that.loadActiveUser();
                    }
                };

                that.createUser = function (body) {
                    var creation = $http.post('/api/user/create', body);
                    creation.then(function () {
                        var url = $location.url();
                        console.log(url);
                        $cookies.put('userCreationUrl', url, {
                            path: '/'
                        });
                    }, function (err) {
                    });
                    return creation;
                };

                that.login = function (username, password) {
                    var authData = $window.btoa(username + ':' + password);
                    var userLogin = $http.get('/api/user/login', {
                    //var userLogin = $http.get('http://labs.gbif-dev.org:7002/user/login', {
                        headers: {'Authorization': 'Basic ' + authData}
                    });
                    userLogin.then(function (response) {
                        console.log(response);
                        $sessionStorage.user = response.data;
                        $rootScope.$broadcast(AUTH_EVENTS.LOGIN_SUCCESS);
                        //$window.location.reload(); //would be safer to reload in case some controller doesn't listen to broadcasted event
                    }, function(){
                        $rootScope.$broadcast(AUTH_EVENTS.LOGIN_FAILURE);
                    });
                    return userLogin;
                };

                that.logout = function () {
                    console.log('logging out ');
                    var logout = $http.get('/api/user/logout');
                    logout.then(function () {
                        delete $sessionStorage.user;
                        $rootScope.$broadcast(AUTH_EVENTS.LOGOUT_SUCCESS);
                        //$window.location.reload(); //would be safer to reload in case some controller doesn't listen to broadcasted event
                    }, function () {
                        $rootScope.$broadcast(AUTH_EVENTS.LOGOUT_FAILED);
                    });
                    return logout;
                };

                that.resetPassword = function () {
                    var passwordReset = $http.get('/api/user/reset');
                    return passwordReset;
                };

                that.updatePassword = function (id, body) {
                    var updatePassword = $http.post('/api/user/' + id + '/updatePassword', body);
                    updatePassword.then(function () {
                        $location.url('/user/login');
                        $window.location.reload();
                    }, function (err) {
                    });
                    return updatePassword;
                };

                that.loadStorageUser();
            }
        );
})();

