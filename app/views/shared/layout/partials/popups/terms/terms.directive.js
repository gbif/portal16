'use strict';

let angular = require('angular');
angular
    .module('portal')
    .directive('terms', termsDirective);

/** @ngInject */
function termsDirective(BUILD_VERSION) {
    let directive = {
        restrict: 'A',
        templateUrl: '/api/template/terms.html?v=' + BUILD_VERSION,
        scope: {},
        replace: true,
        controller: terms,
        controllerAs: 'vm',
        bindToController: true,
    };

    return directive;

    /** @ngInject */
    function terms($cookies) {
        let vm = this;
        vm.userAcceptance = $cookies.get('userAcceptance') === 'true';
        vm.accept = function() {
            // this will set the expiration to 12 months
            let now = new Date(),
                exp = new Date(now.getFullYear()+1, now.getMonth(), now.getDate());
            $cookies.put('userAcceptance', 'true', {
                path: '/',
                expires: exp,
            });
            vm.userAcceptance = true;
        };
    }
}

module.exports = termsDirective;

