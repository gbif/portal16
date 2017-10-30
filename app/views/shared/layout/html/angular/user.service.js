(function () {
    'use strict';
    var angular = require('angular');

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
                    var activeUser = $http.get('/api/user/me');
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
                        $cookies.put('userCreationUrl', url, {
                            path: '/'
                        });
                    }, function () {
                        //TODO inform of failed creation
                    });
                    return creation;
                };

                that.login = function (username, password) {
                    var authData = $window.btoa(username + ':' + password);
                    var userLogin = $http.get('/api/auth/basic', {
                        headers: {'Authorization': 'Basic ' + authData}
                    });
                    userLogin.then(function (response) {
                        $sessionStorage.user = response.data.user;
                        $rootScope.$broadcast(AUTH_EVENTS.LOGIN_SUCCESS);
                        //$window.location.reload(); //would be safer to reload in case some controller doesn't listen to broadcasted event
                    }, function () {
                        $rootScope.$broadcast(AUTH_EVENTS.LOGIN_FAILURE);
                    });
                    return userLogin;
                };

                that.logout = function () {
                    var logout = $http.get('/api/user/logout');
                    logout.then(function () {
                        delete $sessionStorage.user;
                        $rootScope.$broadcast(AUTH_EVENTS.LOGOUT_SUCCESS);
                        window.location = '/user/profile';
                    }, function () {
                        $rootScope.$broadcast(AUTH_EVENTS.LOGOUT_FAILED);
                    });
                    return logout;
                };

                that.resetPassword = function (usernameOrEmail) {
                    var passwordReset = $http.post('/api/user/resetPassword', usernameOrEmail);
                    return passwordReset;
                };

                that.updateForgottenPassword = function (body) {
                    var updatePassword = $http.post('/api/user/updateForgottenPassword', body);
                    updatePassword.then(function () {
                        that.loadActiveUser()
                            .then(function(){
                                $location.url('/user/profile');
                                $window.location.reload();
                            })
                            .catch(function(){
                                $location.url('/user/profile');
                                $window.location.reload();
                            });
                    }, function () {
                        //TODO inform user of failed update. toast?
                    });
                    return updatePassword;
                };

                that.changePassword = function (userName, oldPassword, newPassword) {
                    var authData = $window.btoa(userName + ':' + oldPassword);
                    var config = {
                        headers: {'Authorization': 'Basic ' + authData}
                    };
                    var body = {
                        password: newPassword
                    };
                    var changePassword = $http.post('/api/user/changePassword', body, config);
                    //leave it to consumer to show error
                    return changePassword;
                };

                that.update = function (user) {
                    var update = $http.put('/api/user/update', user);
                    update.then(function () {
                        $rootScope.$broadcast(AUTH_EVENTS.USER_UPDATED);
                    }, function () {
                        //TODO inform of failed creation
                    });
                    return update;
                };

                that.loadStorageUser();
            }
        );
})();

