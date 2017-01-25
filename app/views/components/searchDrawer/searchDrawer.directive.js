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
    function searchDrawer($state) {
        var vm = this;
        vm.isActive = false;
        vm.filter = vm.filter || {};

        vm.getFilterCount = function () {
            var c = 0;
            Object.keys(vm.filter.query).forEach(function (e) {
                var v = vm.filter.query[e];
                var ignoreParams = ['locale', 'facet', 'offset', 'limit', 'center', 'zoom', 'advanced', 'facetMultiselect', 'has_geospatial_issue'];
                if (typeof v !== 'undefined' && v != '' && ignoreParams.indexOf(e) == -1 && e.indexOf('.facetLimit') == -1) {
                    c += [].concat(v).length;
                }
            });
            if (vm.filter.query.has_coordinate === 'true' && vm.filter.query.has_geospatial_issue !== 'false') {
                c += 1;
            }
            return c;
        };

        vm.clear = function () {
            $state.go('.', {}, {inherit: false, notify: true, reload: true});
        };

    }
}

module.exports = searchDrawerDirective;

