'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('filterTernary', filterTernaryDirective);

/** @ngInject */
function filterTernaryDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterTernary/filterTernary.html',
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterTernary,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterTernary() {
        var optionalBooleanRegEx = /(^true$)|(^false$)|^$/g;
        var vm = this;
        vm.queryKey = vm.filterConfig.queryKey;

        vm.change = function () {
            vm.apply();
        };

        vm.apply = function () {
            vm.filterConfig.filter.updateParam(vm.queryKey, vm.query);
        };

        function updateQuery(q) {
            if (typeof q === 'string' && optionalBooleanRegEx.test(q)) {
                vm.query = q;
            } else {
                vm.query = '';
                vm.apply();
            }
        }

        updateQuery(vm.filterState.query[vm.queryKey]);
    }
}

module.exports = filterTernaryDirective;
