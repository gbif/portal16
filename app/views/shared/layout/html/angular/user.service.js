(function() {
    'use strict';
    var angular = require('angular'),
        _ = require('lodash'),
        Base64 = require('js-base64').Base64;

    angular
        .module('portal')
        .constant('AUTH_EVENTS', {
            USER_UPDATED: 'USER_UPDATED',
            LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
            LOGOUT_FAILED: 'LOGOUT_FAILED',
            LOGIN_SUCCESS: 'LOGIN_SUCCESS',
            LOGIN_FAILURE: 'LOGIN_FAILURE'
        })
        .constant('USER_ROLES', {
            REGISTRY_ADMIN: 'REGISTRY_ADMIN',
            REPOSITORY_USER: 'DATA_REPO_USER'
        });

    angular
        .module('portal')
        .service('User', function($http, $sessionStorage, $rootScope, AUTH_EVENTS, $cookies, $location, $window, $q) {
                var that = this;
                var AUTH_TOKEN_NAME = 'token';

                that.userFromToken = function() {
                    var token = $cookies.get(AUTH_TOKEN_NAME);
                    if (!token) {
                        return;
                    }
                    var user = JSON.parse(Base64.decode(token.split('.')[1]));

                    // is the token still valid - if not then delete it. This of course is only to ensure the client knows that the token has expired. any authenticated requests would fail anyhow
                    if (new Date(user.exp * 1000).toISOString() < new Date().toISOString()) {
                        that.logout();
                        return;
                    }

                    if (user.roles) {
                       user.roles = JSON.parse(user.roles);
                    }
                    return user;
                };

                that.hasRole = function(role) {
                    var user = that.userFromToken();
                    return user && _.get(user, 'roles', []).indexOf(role) != -1;
                };

                that.getAuthToken = function() {
                    var token = $cookies.get(AUTH_TOKEN_NAME);
                    if (!token) {
                        delete $sessionStorage.user;
                        $rootScope.$broadcast(AUTH_EVENTS.LOGOUT_SUCCESS);
                    }
                    return token;
                };

                that.loadActiveUser = function() {
                    var token = $cookies.get(AUTH_TOKEN_NAME);
                    if (!token) {
                        var deferred = $q.defer();
                        deferred.reject();
                        return deferred.promise; // return promise so that the consumer knows what to expect
                    }
                    var activeUser = $http.get('/api/user/me');
                    activeUser.then(function(response) {
                        if (response.status === 200) {
                            $sessionStorage.user = response.data;
                            $rootScope.$broadcast(AUTH_EVENTS.USER_UPDATED);
                        } else {
                            delete $sessionStorage.user;
                            $cookies.remove(AUTH_TOKEN_NAME, {path: '/'});
                            $rootScope.$broadcast(AUTH_EVENTS.USER_UPDATED);
                        }
                    }, function() {
                        delete $sessionStorage.user;
                        $cookies.remove(AUTH_TOKEN_NAME, {path: '/'});
                        $rootScope.$broadcast(AUTH_EVENTS.USER_UPDATED);
                    });
                    return activeUser;
                };

                that.loadStorageUser = function() {
                    if (!$sessionStorage.user) {
                        that.loadActiveUser();
                    }
                    // else {
                    //    //check that user stored in session is the same as on the token cookie
                    //    var tokenUser = that.userFromToken();
                    //    if (tokenUser.exp*1000 < Date.now() && tokenUser.userName !== $sessionStorage.user.userName) {
                    //        that.loadActiveUser();
                    //    }
                    // }
                };

                that.createUser = function(body) {
                    var creation = $http.post('/api/user/create', body);
                    creation.then(function() {
                        var url = $location.url();
                        $cookies.put('userCreationUrl', url, {
                            path: '/'
                        });
                    }, function() {
                        // TODO inform of failed creation
                    });
                    return creation;
                };

                that.login = function(username, password) {
                    var authData = Base64.encode(username + ':' + password);
                    var userLogin = $http.get('/api/auth/basic', {
                        headers: {'Authorization': 'Basic ' + authData}
                    });
                    userLogin.then(function(response) {
                        $sessionStorage.user = response.data.user;
                        $rootScope.$broadcast(AUTH_EVENTS.LOGIN_SUCCESS);
                        // $window.location.reload(); //would be safer to reload in case some controller doesn't listen to broadcasted event
                    }, function() {
                        $rootScope.$broadcast(AUTH_EVENTS.LOGIN_FAILURE);
                    });
                    return userLogin;
                };

                that.logout = function(loc) {
                    var logout = $http.get('/api/user/logout');
                    logout.then(function() {
                        delete $sessionStorage.user;
                        $rootScope.$broadcast(AUTH_EVENTS.LOGOUT_SUCCESS);
                        window.location = loc || '/user/profile';
                    }, function() {
                        $rootScope.$broadcast(AUTH_EVENTS.LOGOUT_FAILED);
                    });
                    return logout;
                };

                that.resetPassword = function(usernameOrEmail) {
                    var passwordReset = $http.post('/api/user/resetPassword', usernameOrEmail);
                    return passwordReset;
                };

                that.updateForgottenPassword = function(body) {
                    var updatePassword = $http.post('/api/user/updateForgottenPassword', body);
                    updatePassword.then(function() {
                        that.loadActiveUser()
                            .then(function() {
                                window.location = '/user/profile';
                            })
                            .catch(function() {
                                window.location = '/user/profile';
                            });
                    }, function() {
                        // TODO inform user of failed update. toast?
                    });
                    return updatePassword;
                };

                that.changePassword = function(userName, oldPassword, newPassword) {
                    var authData = $window.btoa(userName + ':' + oldPassword); // the identity API assumes btoa encoded
                    var config = {
                        headers: {'Authorization': 'Basic ' + authData}
                    };
                    var body = {
                        password: newPassword
                    };
                    var changePassword = $http.post('/api/user/changePassword', body, config);
                    // leave it to consumer to show error
                    return changePassword;
                };

                that.update = function(user) {
                    var update = $http.put('/api/user/update', user);
                    update.then(function() {
                        $rootScope.$broadcast(AUTH_EVENTS.USER_UPDATED);
                    }, function() {
                        // TODO inform of failed creation
                    });
                    return update;
                };

                that.loadStorageUser();
            }
        );
})();

