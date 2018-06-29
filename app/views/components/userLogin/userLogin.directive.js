'use strict';

require('../../shared/layout/html/angular/user.service');
require('../../shared/layout/html/angular/regexPatterns.constants');

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('userLogin', userLoginDirective);

/** @ngInject */
function userLoginDirective(BUILD_VERSION, LOCALE, regexPatterns) {
    var directive = {
        restrict: 'A',
        templateUrl: '/templates/components/userLogin/userLogin.html?v=' + BUILD_VERSION,
        scope: {},
        replace: true,
        controller: userLogin,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function userLogin($cookies, $location, $stateParams, $q, $http, User, $scope, AUTH_EVENTS, toastService, $sessionStorage) {
        var vm = this;
        vm.disableRegistration = false;
        vm.emailPattern = regexPatterns.email;
        vm.userNamePattern = regexPatterns.userName;
        vm.verification = false;
        vm.country;
        vm.answer = {};
        vm.searchSuggestions;
        vm.loginState = true;
        vm.challenge;
        vm.verificationFailed = false;

        // read flash cookie and remove it
        var loginFlashInfo = $cookies.get('loginFlashInfo') || '{}';
        $cookies.remove('loginFlashInfo', {path: '/'});
        var loginState = JSON.parse(loginFlashInfo);

        var state = loginState.state;
        vm.countryCode = loginState.countryCode;
        vm.username = loginState.userName;
        vm.authProvider = loginState.authProvider;
        vm.errorMessage = loginState.error;

        function clearFlashMessage() {
            vm.errorMessage = undefined;
        }

        vm.getSuggestions = function() {
            // get list of countries
            var countryList = $http.get('/api/country/suggest.json?lang=' + LOCALE + '&v=' + BUILD_VERSION);// TODO needs localization of suggestions
            countryList.then(function(response) {
                vm.searchSuggestions = response.data;
                vm.country = vm.countryCode;
            }).catch(function() {
                vm.country = vm.countryCode;
            });

            // get users estimated location
            var geoip = $http.get('/api/utils/geoip/country');

            // once both are in, then set country to users location if not already set
            if (!vm.countryCode) {
                $q.all([geoip, countryList]).then(function(values) {
                    // geoip return 204 if there is no known country for that IP
                    var isoCode = _.get(values, '[0].data.countryCode');
                    if (isoCode) {
                        var usersCountry = values[1].data.find(function(e) {
                            return e.key === isoCode;
                        });
                        vm.country = vm.country || usersCountry.key;
                    }
                });
            }
        };

        vm.typeaheadSelect = function(item) { //  model, label, event
            if (angular.isUndefined(item) || angular.isUndefined(item.key)) return;
            vm.countryCode = item.key;
        };

        vm.formatTypehead = function(searchSuggestions, isoCode) {
            var o = _.find(searchSuggestions, {key: isoCode});
            return (o ? o.title || o.key : isoCode);
        };

        vm.getSuggestions();

        vm.changeState = function(state, keepErrors) {
            vm.loginState = vm.createState = vm.loggedinState = vm.resetState = vm.resetMailSentState = vm.externalAuthState = false;
            vm.formInvalid = false;
            vm.invalidLogin = false;
            switch (state) {
                case 'CREATE':
                    vm.verification = false;
                    vm.createState = true;
                    break;
                case 'RESET':
                    vm.resetState = true;
                    break;
                case 'CREATED':
                    vm.verificationFailed = false;
                    vm.createdState = true;
                    break;
                case 'LOGGEDIN':
                    vm.loggedinState = true;
                    break;
                case 'RESET_MAIL_SENT':
                    vm.resetMailSentState = true;
                    break;
                case 'EXTERNAL_AUTH_STATE':
                    vm.externalAuthState = true;
                    break;
                default:
                    vm.loginState = true;
            }
            if (!keepErrors) {
                clearFlashMessage();
            }
        };

        vm.getChallenge = function() {
            vm.waiting = true;
            $http.get('/api/verification/challenge').then(function(response) {
                vm.answer = {};
                vm.challenge = response.data;
                vm.waiting = false;
            }, function() {
                toastService.error({
                    translate: 'phrases.criticalErrorMsg',
                    feedback: true
                });
                vm.waiting = false;
            });
        };

        vm.clearForms = function() {
            vm.email = vm.username = vm.password = vm.answer = undefined;
        };

        vm.resetPassword = function() {
            var reset = User.resetPassword({userNameOrEmail: vm.userNameOrEmail});
            vm.waiting = true;
            reset.then(function() {
                vm.changeState('RESET_MAIL_SENT');
                vm.waiting = false;
            }, function(err) {
                vm.waiting = false;
                if (err.status < 500) { // 401 seems an odd error code for 'no such entry' but that is what the API returns
                    // TODO move error messages to translation file
                    toastService.error({translate: 'profile.unknownUser', feedback: true});
                } else {
                    toastService.error({translate: 'phrases.criticalErrorMsg', feedback: true});
                }
            });
        };

        vm.createNext = function() {
            if (vm.createUserForm.$valid) {
                vm.waiting = true;
                vm.verification = true;
                vm.getChallenge();
            } else {
                vm.touchFields(vm.createUserForm);
                vm.formInvalid = true;
            }
        };

        vm.touchFields = function(form) {
            angular.forEach(form.$error, function(field) {
                angular.forEach(field, function(errorField) {
                    errorField.$setTouched();
                });
            });
        };
        vm.signup = function() {
            vm.creationFailure = undefined;
            if (vm.createUserForm.$valid) {
                vm.waiting = true;
                vm.formInvalid = false;
                var body = {
                    challenge: {},
                    user: {
                        settings: {
                            country: vm.country
                        },
                        userName: vm.username,
                        email: vm.email,
                        password: vm.password
                    }
                };
                body.challenge.answer = Object.keys(vm.answer).filter(function(e) {
                    return vm.answer[e];
                });
                body.challenge.id = vm.challenge.id;

                var createUserPromise = User.createUser(body);
                createUserPromise.then(function() {
                    vm.changeState('CREATED');
                    vm.waiting = false;
                }, function(err) {
                    if (err.status === 401) {
                        vm.getChallenge();
                    } else {
                        // TODO get all possible error types from Christian and add them to the translation file
                        vm.verification = false;
                        vm.waiting = false;
                        vm.creationFailure = _.get(err, 'data.error');
                    }
                });
            } else {
                vm.verification = false;
                vm.formInvalid = true;
                vm.challenge = {};
            }
        };

        vm.submitLogin = function() {
            // check to make sure the form is completely valid
            vm.invalidLogin = false;
            if (vm.loginUserForm.$valid) {
                vm.waiting = true;
                var loginPromise = User.login(vm.username, vm.password);
                loginPromise.then(function() {
                    // any notifications?
                    vm.waiting = false;
                }, function() {
                    vm.waiting = false;
                    vm.invalidLogin = true;// TODO differentiate between failed invalid login and failed login
                });
            }
        };

        vm.createFromProvider = function(country, userName, provider) {
            if (vm.createUserExternalAuth.$valid) {
                window.location = '/auth/' + provider + '/register?countryCode=' + country + '&userName=' + userName;
            } else {
                vm.formInvalid = true;
            }
        };

        function getActiveUser() {
            vm.user = {};
            if ($sessionStorage.user) {
                vm.changeState('LOGGEDIN', true);
                vm.user = $sessionStorage.user;
            } else {
                if (state == 'REGISTER') {
                    if (vm.authProvider) {
                        vm.changeState('EXTERNAL_AUTH_STATE', true);
                    } else {
                        vm.changeState('CREATE', true);
                    }
                } else {
                    vm.changeState('LOGIN', true);
                }
            }
        }
        getActiveUser();

        vm.logout = function() {
            vm.waiting = true;
            var logout = User.logout();
            logout.then(function() {
                vm.waiting = false;
            }, function() {
                vm.waiting = false;
            });
        };

        $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function() {
            vm.isActive = false;
            vm.clearForms();
            vm.changeState('LOGIN');
        });

        $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function() {
            vm.isActive = false;
            vm.changeState('LOGGEDIN');
            getActiveUser();
        });
    }
}


module.exports = userLoginDirective;
