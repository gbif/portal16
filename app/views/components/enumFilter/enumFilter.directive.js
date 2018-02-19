'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('enumFilter', enumFilterDirective);

/** @ngInject */
function enumFilterDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/enumFilter/enumFilter.html?v=' + BUILD_VERSION,
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: enumFilter,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function enumFilter($scope, $filter) {
        var vm = this;
        vm.filterConfig.enumValues = vm.filterConfig.enumValues;
        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.facetKey = vm.filterConfig.facetKey;
        vm.translationPrefix = vm.filterConfig.translationPrefix || vm.filterConfig.title;
        vm.filterAutoUpdate = vm.filterConfig.filterAutoUpdate !== false;
        vm.collapsed = vm.filterConfig.collapsed !== false;

        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);
        vm.checkboxModel = {};
        vm.facets = {};

        function setModel(query) {
            vm.filterConfig.enumValues.forEach(function(e) {
                vm.checkboxModel[e] = false;
            });
            query.forEach(function(e) {
                vm.checkboxModel[e] = true;
            });
        }

        setModel(vm.query);

        vm.getWidth = function(enumName) {
            if (!vm.filterState ||
                !vm.filterState.data ||
                !vm.filterState.data.facets ||
                !vm.filterState.data.facets[vm.facetKey] ||
                !vm.filterState.data.facets[vm.facetKey].counts ||
                !vm.filterState.data.facets[vm.facetKey].counts[enumName]) {
                return {
                    width: '0px'
                };
            }
            var fraction = vm.filterState.data.facets[vm.facetKey].counts[enumName].fraction;
            var gear = 100 / (vm.filterState.data.facets[vm.facetKey].max / vm.filterState.data.count);
            var width = fraction * gear;
            return {
                width: width + '%'
            };
        };

        vm.showFacetCount = function() {
            return vm.facetKey && !vm.collapsed && vm.query.length != 1;
        };

        vm.reverse = function() {
            vm.filterConfig.enumValues.forEach(function(key) {
                vm.checkboxModel[key] = !vm.checkboxModel[key];
            });
            vm.apply();
        };

        vm.uncheckAll = function() {
            vm.filterConfig.enumValues.forEach(function(key) {
                vm.checkboxModel[key] = false;
            });
            vm.apply();
        };

        vm.apply = function() {
            if (vm.filterAutoUpdate) {
                vm.query = vm.filterConfig.enumValues.filter(function(e) {
                    return !!vm.checkboxModel[e];
                });
                vm.filterConfig.filter.updateParam(vm.queryKey, vm.query);
            }
        };

        $scope.$watch(function() {
            return vm.filterState.query[vm.queryKey];
        }, function(newQuery) {
            vm.query = $filter('unique')(newQuery);
            setModel(vm.query);
        });
    }
}

module.exports = enumFilterDirective;
