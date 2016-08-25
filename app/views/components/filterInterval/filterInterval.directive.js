'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('filterInterval', filterIntervalDirective);

/** @ngInject */
function filterIntervalDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterInterval/filterInterval.html',
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterInterval,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterInterval($scope, $filter, OccurrenceFilter) {
        var vm = this;
        vm.enumValues = vm.filterConfig.enumValues;
        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.translationPrefix = vm.filterConfig.translationPrefix || vm.filterConfig.title;
        vm.filterAutoUpdate = vm.filterConfig.filterAutoUpdate !== false;
        vm.collapsed = vm.filterConfig.collapsed !== false;

        vm.query = $filter('unique')(vm.filterState.query[vm.title]);
        vm.start = '';
        vm.end = '';

        vm.options = ['between', 'is', 'lessThan', 'largerThan'];
        vm.selected = vm.options[0];

        $scope.$watch(function(){return vm.filterState.query[vm.title]}, function(newQuery){
            vm.query = $filter('unique')(newQuery);
        });

        vm.selectType = function(choice) {
            vm.selected = choice;
            if (vm.selected != 'between') {
                vm.end = '';
            }
        };
        vm.isValid = function() {
            return vm.form.$valid && (vm.start != '' || vm.end != '');
        };
        vm.uncheckAll = function() {
            
        };
        vm.apply = function() {
            OccurrenceFilter.updateParam(vm.queryKey, vm.query);
        }
    }
}

module.exports = filterIntervalDirective;
