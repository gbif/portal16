'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('userProfileCtrl', userProfileCtrl);

/** @ngInject */
function userProfileCtrl($cookies, User, BUILD_VERSION, LOCALE, regexPatterns, $http, toastService) {
    var vm = this;
    vm.disableEditing = false;
    vm.emailPattern = regexPatterns.email;

    vm.getUser = function() {
        var activeUser = User.loadActiveUser();
        vm.profile = {};
        activeUser.then(function(response) {
            vm.profile = response.data;
            vm.original = JSON.parse(JSON.stringify(vm.profile));

            // read flash cookie and remove it
            var profileFlashInfo = $cookies.get('profileFlashInfo') || '{}';
            $cookies.remove('profileFlashInfo', {path: '/'});
            var profileInfo = JSON.parse(profileFlashInfo);
            vm.errorMessage = profileInfo.error;
            vm.provider = profileInfo.authProvider;
        }, function() {
            vm.loadingActiveUserFailed = true;
            // TODO handle errors - log out or inform user that the user cannot be loaded
        });
    };
    vm.getUser();

    // TODO this country selector is useds again and again - it should be refactored to be reusable code
    vm.getSuggestions = function() {
        // get list of countries
        var countryList = $http.get('/api/country/suggest.json?lang=' + LOCALE + '&v=' + BUILD_VERSION);// TODO needs localization of suggestions
        countryList.then(function(response) {
            vm.searchSuggestions = response.data;
        });
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

    vm.editModeChanged = function() {
        if (!vm.inEditMode) {
            vm.profile = JSON.parse(JSON.stringify(vm.original));
            vm.repeatedPassword = vm.newPassword = vm.oldPassword = undefined;
        }
    };

    vm.updateProfile = function() {
        if (vm.profileForm.$valid) {
            vm.profileFormInvalid = false;
            User.update(vm.profile)
                .then(function() {
                    toastService.error({translate: 'profile.accountInfoUpdated', feedback: false});
                    vm.original = JSON.parse(JSON.stringify(vm.profile));
                    vm.inEditMode = false;
                    vm.editModeChanged();
                })
                .catch(function(err) {
                    if (err.status === 401) {
                        User.logout();
                    } else {
                        toastService.error({translate: 'phrases.criticalErrorMsg', feedback: true});
                    }
                });
        } else {
            vm.profileFormInvalid = true;
        }
    };

    vm.changePassword = function() {
        var identicalPasswords = vm.repeatedPassword === vm.newPassword;
        if (vm.passwordForm.$valid && identicalPasswords) {
            vm.passwordFormInvalid = false;
            User.changePassword(vm.profile.userName, vm.oldPassword, vm.newPassword)
                .then(function() {
                    toastService.error({translate: 'profile.accountInfoUpdated', feedback: false});
                    vm.original = JSON.parse(JSON.stringify(vm.profile));
                    vm.inEditMode = false;
                    vm.editModeChanged();
                })
                .catch(function(err) {
                    if (err.status === 401) {
                        toastService.error({translate: 'profile.passwordChangeInvalid', feedback: true});
                    } else {
                        toastService.error({translate: 'phrases.criticalErrorMsg', feedback: true});
                    }
                });
        } else {
            vm.passwordFormInvalid = true;
        }
    };
}

module.exports = userProfileCtrl;
