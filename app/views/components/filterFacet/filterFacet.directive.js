'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('filterFacet', filterFacetDirective);

/** @ngInject */
function filterFacetDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterFacet/filterFacet.html?v=' + BUILD_VERSION,
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterFacet,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterFacet($scope, $filter) {
        var vm = this;
        vm.disabled = false;
        vm.filterAutoUpdate = true;
        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.translationPrefix = vm.filterConfig.translationPrefix || 'filterNames';
        vm.collapsed = vm.filterConfig.collapsed !== false;
        vm.facetKey = vm.filterConfig.facetKey;
        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);
        vm.checkboxModel = {};

        vm.options = {};

        function setModel(query) {
            query.forEach(function(e) {
                vm.checkboxModel[e] = true;
            });
        }

        setModel(vm.query);

        vm.showFacetCount = function() {
            return vm.facetKey && !vm.collapsed && Object.keys(vm.options).length > 1;
        };

        vm.apply = function() {
            if (vm.filterAutoUpdate && !vm.disabled) {
                vm.query = [];
                Object.keys(vm.checkboxModel).forEach(function(key) {
                    if (vm.checkboxModel[key]) {
                        vm.query.push(key);
                    }
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

        vm.updateOptions = function(apiResponse) {
            vm.options = apiResponse.facets[vm.facetKey].counts;
            if (angular.isArray(apiResponse.filters[vm.facetKey])) {
                apiResponse.filters[vm.facetKey].forEach(function(e) {
                    vm.options[e.name] = vm.options[e.name] || e;
                });
            }
        };

        $scope.$watch(function() {
            if (vm.filterConfig.useFacetMultiselect && typeof vm.filterState.query[vm.filterConfig.queryKey] !== 'undefined') {
                return vm.filterState.facetMultiselect;
            }
            return vm.filterState.data;
        }, function(newData) {
            vm.disabled = true;
            newData.$promise.then(function(data) {
                vm.updateOptions(data);
                vm.disabled = false;
            }, function() {
                vm.disabled = false;
            });
        });

        vm.filterState.data.$promise.then(function(data) {
            vm.updateOptions(data);
        });
    }
}

module.exports = filterFacetDirective;
