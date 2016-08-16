'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('searchDrawer', searchDrawerDirective);

/** @ngInject */
function searchDrawerDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/searchDrawer/searchDrawer.html',
        scope: {
            query: '@',
            contentType: '@'
        },
        replace: true,
        controller: searchDrawer,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function searchDrawer($rootScope, $stateParams) {
        var vm = this;

        //$rootScope.$on('$stateChangeSuccess',
        //    function(event, toState, toParams, fromState, fromParams){
        //        vm.setFilterCount(toParams);
        //    });

        vm.getFilterCount = function() {
            var c = 0;
            Object.keys($stateParams).forEach(function(e){
                var v = $stateParams[e];
                if (typeof v !== 'undefined' && e != 'locale' && e != 'offset' && e != 'limit' && e != 'center' && e != 'zoom') {
                    c++;
                }
            });
            return c;
        };

    }
}

module.exports = searchDrawerDirective;
