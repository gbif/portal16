'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('terms', termsDirective);

/** @ngInject */
function termsDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        templateUrl: '/api/template/terms.html?v=' + BUILD_VERSION,
        scope: {},
        replace: true,
        controller: terms,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function terms($cookies, $window) {
        var vm = this;
        vm.userAcceptance = $cookies.get('userAcceptance') === 'dec2018';
        vm.accept = function() {
            // this will set the expiration to 12 months
            var now = new Date(),
                exp = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            $cookies.put('userAcceptance', 'dec2018', {
                path: '/',
                expires: exp
            });
            vm.userAcceptance = true;
            if (!$window.ga) $window.attachGoogleAnalytics();
        };
    }
}

module.exports = termsDirective;

