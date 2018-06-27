'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('menuSearch', menuSearchDirective);

/** @ngInject */
function menuSearchDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/shared/layout/partials/menuSearch/menuSearch.html?v=' + BUILD_VERSION,
        scope: {},
        replace: true,
        controller: menuSearch,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function menuSearch($scope, NAV_EVENTS, $timeout, IS_TOUCH, URL_PREFIX) {
        var vm = this;
        vm.isActive = false;

        $scope.$on(NAV_EVENTS.toggleSearch, function(event, data) {
            if (data.toggle) {
                vm.isActive = !vm.isActive;
            } else {
                vm.isActive = data.state;
            }
            vm.focus = false;
            $timeout(function() {
                vm.focus = true;
            }, 100);
        });

        vm.close = function() {
            vm.isActive = false;
        };

        vm.searchRedirect = function() {
            location.href = URL_PREFIX + '/search?q=' + encodeURIComponent(vm.freeTextQuery || '');
        };

        vm.closeOnEsc = function(event) {
            if (event.which === 27) {
                vm.isActive = false;
            }
        };

        vm.clickedOutside = function() {
            if (!IS_TOUCH) {
                vm.isActive = false;
            }
        };

        // vm.clearFreetextAndSetFocus = function () {
        //    vm.isActive = true;
        //    document.getElementById('menuSearchBox').focus();
        //    vm.freeTextQuery = '';
        // };

        // hotkeys.add(
        //    {
        //        combo: ['alt+f', 'alt+space'],
        //        description: 'Site search',
        //        callback: function (event) {
        //            vm.isActive = true;
        //            vm.clearFreetextAndSetFocus();
        //            event.preventDefault();
        //        }
        //    }
        // );
    }
}

module.exports = menuSearchDirective;


