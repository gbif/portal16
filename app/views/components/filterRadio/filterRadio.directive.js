'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('filterRadio', filterRadioDirective);

/** @ngInject */
function filterRadioDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterRadio/filterRadio.html',
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterRadio,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterRadio($scope, $filter, OccurrenceFilter) {
        var vm = this;
        vm.enumValues = vm.filterConfig.enumValues;
        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.translationPrefix = vm.filterConfig.translationPrefix || vm.filterConfig.title;
        vm.filterAutoUpdate = vm.filterConfig.filterAutoUpdate !== false;
        vm.collapsed = vm.filterConfig.collapsed !== false;

        vm.query = $filter('unique')(vm.filterState.query[vm.title]);

        $scope.$watch(function () {
            return vm.filterState.query[vm.title]
        }, function (newQuery) {
            vm.query = $filter('unique')(newQuery);
        });

        vm.change = function (e, checked) {
            if (vm.filterAutoUpdate) {
                if (checked) {
                    vm.query.push(e);
                } else {
                    vm.query.splice(vm.query.indexOf(e), 1);
                }
                vm.apply();
            }
        };
        vm.reverse = function () {
            vm.query = vm.enumValues.filter(function (e) {
                return vm.query.indexOf(e) == -1;
            });
            if (vm.filterAutoUpdate) {
                vm.apply();
            }
        };
        vm.uncheckAll = function () {
            vm.query = [];
            if (vm.filterAutoUpdate) {
                vm.apply();
            }
        };
        vm.apply = function () {
            OccurrenceFilter.updateParam(vm.queryKey, vm.query);
        }
    }
}

module.exports = filterRadioDirective;
