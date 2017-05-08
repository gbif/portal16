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
    function userLogin($q, $http, User, $scope, AUTH_EVENTS, toastService, $sessionStorage) {
        var vm = this;
        vm.disableRegistration = true;
        vm.emailPattern = regexPatterns.email;
        vm.userNamePattern = regexPatterns.userName;
        vm.verification = false;
        vm.country;
        vm.answer = {};
        vm.searchSuggestions;
        vm.loginState = true;
        vm.challenge;
        vm.verificationFailed = false;

        vm.getSuggestions = function () {
            //get list of countries
            var countryList = $http.get('/api/country/suggest.json?lang=' + LOCALE + '&v=' + BUILD_VERSION);//TODO needs localization of suggestions
            countryList.then(function (response) {
                vm.searchSuggestions = response.data;
            });

            //get users estimated location
            var geoip = $http.get('/api/utils/geoip/country');

            //once both are in, then set country to users location if not already set
            $q.all([geoip, countryList]).then(function (values) {
                var isoCode = _.get(values, '[0].countryCode');
                if (isoCode) {
                    var usersCountry = values[1].data.find(function (e) {
                        return e.key === isoCode
                    });
                    vm.country = vm.country || usersCountry;
                }
            });
        };

        vm.typeaheadSelect = function (item) { //  model, label, event
            if (angular.isUndefined(item) || angular.isUndefined(item.key)) return;
            vm.countryCode = item.key;
        };

        vm.formatTypehead = function(searchSuggestions, isoCode){
            var o = _.find(searchSuggestions, {key:isoCode});
            return (o ? o.title || o.key : isoCode);
        };

        vm.getSuggestions();

        vm.changeState = function (state) {
            vm.loginState = vm.createState = vm.loggedinState = vm.resetState = vm.resetMailSentState = false;
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
                default:
                    vm.loginState = true;
            }
        };

        vm.getChallenge = function () {
            vm.waiting = true;
            $http.get('/api/verification/challenge').then(function (response) {
                vm.answer = {};
                vm.challenge = response.data;
                vm.waiting = false;
            }, function () {
                toastService.error({
                    message: "Hmm - this isn't good. Please try to refresh. If the problem persists, then please let us know.",
                    feedback: true
                });
                vm.waiting = false;
            });
        };

        vm.clearForms = function () {
            vm.email = vm.username = vm.password = vm.answer = undefined;
        };

        vm.resetPassword = function () {
            var reset = User.resetPassword({userNameOrEmail: vm.userNameOrEmail});
            vm.waiting = true;
            reset.then(function () {
                vm.changeState('RESET_MAIL_SENT');
                vm.waiting = false;
            }, function (err) {
                vm.waiting = false;
                if (err.status < 500) { //401 seems an odd error code for 'no such entry' but that is what the API returns
                    //TODO move error messages to translation file
                    toastService.error({message: "Unknown username or email", feedback: true});
                } else {
                    toastService.error({message: "We couldn't reset you password right now - please try again later. Sorry for the inconvenience", feedback: true});
                }
            });
        };

        vm.createNext = function () {
            if (vm.createUserForm.$valid) {
                vm.waiting = true;
                vm.verification = true;
                vm.getChallenge()
            } else {
                vm.touchFields(vm.createUserForm);
                vm.formInvalid = true;
            }
        };

        vm.touchFields = function (form) {
            angular.forEach(form.$error, function (field) {
                angular.forEach(field, function (errorField) {
                    errorField.$setTouched();
                })
            });
        };
        vm.signup = function () {
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
                //UNCOMMENT IF USING HUMAN VERIFICATION
                body.challenge.answer = Object.keys(vm.answer).filter(function (e) {
                    return vm.answer[e];
                });
                body.challenge.id = vm.challenge.id;

                var createUserPromise = User.createUser(body);
                createUserPromise.then(function () {
                    vm.changeState('CREATED');
                    vm.waiting = false;
                }, function (err) {
                    if (err.status === 401) {
                        vm.getChallenge();
                    } else {
                        //TODO get all possible error tpes from Christian and add them to the translation file
                        vm.verification = false;
                        vm.waiting = false;
                        vm.creationFailure = _.get(err, 'data.error');
                        //toastService.error({
                        //    message: "We couldn't create your account. Please try again and let us know if the problem persists",
                        //    feedback: true
                        //});
                    }
                });
            } else {
                vm.verification = false;
                vm.formInvalid = true;
                vm.challenge = {};
            }
        };

        vm.submitLogin = function () {
            // check to make sure the form is completely valid
            vm.invalidLogin = false;
            if (vm.loginUserForm.$valid) {
                vm.waiting = true;
                var loginPromise = User.login(vm.username, vm.password);
                loginPromise.then(function () {
                    //any notifications?
                    vm.waiting = false;
                }, function () {
                    vm.waiting = false;
                    vm.invalidLogin = true;//TODO differentiate between failed invalid login and failed login
                });
            }
        };

        function getActiveUser() {
            vm.user = {};
            if ($sessionStorage.user) {
                vm.changeState('LOGGEDIN');
                vm.user = $sessionStorage.user;
            } else {
                vm.changeState('LOGIN');
            }
        }

        getActiveUser();

        vm.logout = function () {
            vm.waiting = true;
            var logout = User.logout();
            logout.then(function () {
                vm.waiting = false;
            }, function () {
                vm.waiting = false;
            });
        };

        $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function () {
            vm.isActive = false;
            vm.clearForms();
            vm.changeState('LOGIN');
        });

        $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function () {
            vm.isActive = false;
            vm.changeState('LOGGEDIN');
            getActiveUser();
        });

    }
}


module.exports = userLoginDirective;
