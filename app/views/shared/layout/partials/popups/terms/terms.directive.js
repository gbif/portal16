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
    function terms($cookies, $window, termsVersion) {
        var vm = this;
        vm.hasDecided = false;
        var termsValue = $cookies.get('userAcceptance');

        if (termsValue) {
          // the cookie looks like: version__choice e.g. dec2018__accepted
          var cookieParts = termsValue.split('__');
          var cookieVersion = cookieParts[0];
          // if the version in the cookie match the current version of the terms, then do not show anything.
          if (cookieVersion === termsVersion) {
            vm.hasDecided = true;
          }

          // extract the users choice (accepted | rejected)
          // var userDecision = cookieParts[1];
          // if (!userDecision) {
          //   userDecision = 'accepted'; // to accomodate the previous format where we didn't store the users choice
          // }
        }

        vm.accept = function() {
            // this will set the expiration to 12 months
            var now = new Date(),
                exp = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            $cookies.put('userAcceptance', termsVersion + '__accepted', {
                path: '/',
                expires: exp
            });
            vm.hasDecided = true;
            if (!$window.ga) $window.attachGoogleAnalytics();
        };

        vm.reject = function() {
          // this will set the expiration to 12 months
          var now = new Date(),
              exp = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
          $cookies.put('userAcceptance', termsVersion + '__rejected', {
              path: '/',
              expires: exp
          });
          vm.hasDecided = true;
      };

      if (termsValue === 'dec2018') {
        vm.accept();
      }
    }
}

module.exports = termsDirective;

