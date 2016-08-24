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
            filter: '=',
            contentType: '@'
        },
        replace: true,
        controller: searchDrawer,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function searchDrawer() {
        var vm = this;
        vm.filter = vm.filter || {};

        vm.getFilterCount = function() {
            var c = 0;
            Object.keys(vm.filter.query).forEach(function(e){
                var v = vm.filter.query[e];
                if (typeof v !== 'undefined' && v!= '' && e != 'locale' && e != 'facet' && e != 'offset' && e != 'limit' && e != 'center' && e != 'zoom') {
                    c += [].concat(v).length;
                }
            });
            return c;
        };
    }
}

module.exports = searchDrawerDirective;
