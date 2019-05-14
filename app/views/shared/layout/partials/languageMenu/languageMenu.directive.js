'use strict';

var angular = require('angular');
var _ = require('lodash');

angular
    .module('portal')
    .directive('languageMenu', languageMenuDirective);

/** @ngInject */
function languageMenuDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/shared/layout/partials/languageMenu/languageMenu.html?v=' + BUILD_VERSION,
        scope: {},
        replace: true,
        controller: languageMenu,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function languageMenu($http, $cookies, $localStorage, $scope, NAV_EVENTS, AUTH_EVENTS, IS_RTL, LOCALE, LOCALE_MAPPINGS, env) {
        var vm = this;
        vm.locales = env.locales;
        vm.LOCALE_MAPPINGS = LOCALE_MAPPINGS;
        vm.IS_RTL = IS_RTL;
        vm.chosenLocale = LOCALE;
        vm.isActive = false;

        $scope.$on(NAV_EVENTS.toggleLanguage, function(event, data) {
            if (data.toggle) {
                vm.isActive = !vm.isActive;
            } else {
                vm.isActive = data.state;
            }
        });

        // has accepted cookies - to avoid 2 popups at the same time
        var userAcceptedCookies = $cookies.get('userAcceptance') === 'true';
        if (!$localStorage.hasSuggestedLanguage && userAcceptedCookies) {
            $http.get('/api/translation/suggested')
                .then(function(response) {
                    vm.suggestedLanguage = response.data;
                    if (vm.suggestedLanguage.matched !== vm.chosenLocale) {
                        vm.isActive = true;
                        $localStorage.hasSuggestedLanguage = true;
                    }
                })
                .catch(function(err) {
                    // ignore errors
                });
        }

        vm.close = function() {
            vm.isActive = false;
        };

        vm.changeLanguage = function() {
            var pathname = location.pathname;
            var localePrefix = vm.chosenLocale == 'en' ? '' : '/' + vm.chosenLocale;
            if (_.startsWith(pathname, '/' + LOCALE + '/')) {
                pathname = pathname.substr(LOCALE.length + 1);
            }
            window.location.href = localePrefix + pathname + location.search + location.hash;
        };
    }
}

module.exports = languageMenuDirective;


