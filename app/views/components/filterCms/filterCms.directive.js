'use strict';

var angular = require('angular');

angular
    .module('portal')
    .directive('filterCms', filterCmsDirective);

/** @ngInject */
function filterCmsDirective() {
    return {
        restrict: 'A',
        templateUrl: '/templates/components/filterCms/filterCms.html',
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterCms,
        controllerAs: 'vm',
        bindToController: true
    };

    /** @ngInject */
    function filterCms($scope, $http, $filter) {
        var vm = this;

        vm.queryKey = vm.filterConfig.queryKey;
        vm.hasFacets = vm.filterConfig.facets && vm.filterConfig.facets.hasFacets;
        // explicitly set collapsed by default.
        vm.expanded = (vm.filterConfig.expanded) ? vm.filterConfig.expanded : false;

        vm.hasFacetSuggestions = !!vm.filterConfig.faceted;
        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);
        // expand if checked.
        vm.expanded = vm.query.length > 0;

        $scope.$watch(function () {
            return vm.filterState.query[vm.queryKey]
        }, function (newQuery) {
            vm.query = $filter('unique')(newQuery);
        });

        $scope.$watchCollection(function () {
            return vm.filterState.query
        }, function (newState, oldState) {
            if (vm.filterConfig.facets && vm.filterConfig.facets.hasFacets && !angular.equals(newState, oldState)) {
                vm.setFacetSuggestions();
            }
        });

        vm.hideFacetCounts = false;
        vm.suggestions = {};
        vm.setFacetSuggestions = function () {
            if (vm.filterConfig.facets && vm.filterConfig.facets.hasFacets) {
                vm.hideFacetCounts = true;
                if (vm.query.length > 0 && vm.filterState.facetMultiselect.$promise) {
                    vm.filterState.facetMultiselect.$promise.then(function (data) {
                        vm.hideFacetCounts = false;
                        if (data.hasOwnProperty('facets')) {
                            vm.suggestions = data.facets[vm.filterConfig.facets.facetKey];
                            vm.facetTitle = data.facets[vm.filterConfig.facets.facetKey].translatedLabel;
                        }
                    });
                } else {
                    vm.filterState.data.$promise.then(function (data) {
                        vm.hideFacetCounts = false;
                        if (data.hasOwnProperty('facets')) {
                            vm.suggestions = data.facets[vm.filterConfig.facets.facetKey];
                            vm.facetTitle = data.facets[vm.filterConfig.facets.facetKey].translatedLabel;
                        }
                    });
                }
            }
        };

        vm.setFacetSuggestions();

        vm.searchSuggestions = [];
        vm.getSuggestions = function () {
            if (vm.filterConfig.search && vm.filterConfig.search.isSearchable && vm.filterConfig.search.suggestEndpoint) {
                return $http.get(vm.filterConfig.search.suggestEndpoint
                ).then(function (response) {
                    vm.searchSuggestions = response.data;
                });
            }
        };
        vm.getSuggestions();

        vm.inQuery = function (name) {
            return vm.query.indexOf(name) != -1;
        };

        vm.showFacetCount = function () {
            return vm.expanded && vm.filterConfig.facets && vm.filterConfig.facets.hasFacets;
        };

        vm.getWidth = function (key) {
            if (!vm.suggestions.counts) return;
            if (!vm.showFacetCount() || !vm.filterState.data || !vm.filterState.data.count || !vm.suggestions || !vm.suggestions.counts || !vm.suggestions.counts[key]) {
                return {
                    width: '0%'
                }
            }
            var fraction = vm.suggestions.counts[key].fraction;
            var gear = 100 / (vm.suggestions.max / vm.filterState.data.count);
            var width = fraction * gear;
            return {
                width: width + '%'
            };
        };

        vm.typeaheadSelect = function (item) { //  model, label, event
            if (angular.isUndefined(item) || angular.isUndefined(item.key)) return;
            var searchString = item.key.toString();
            if (searchString !== '' && vm.query.indexOf(searchString) < 0) {
                vm.query.push(searchString);
                vm.selected = '';
                vm.apply();
            }
        };

        vm.change = function (e, checked) {
            if (checked) {
                vm.query.push(e);
            } else {
                vm.query.splice(vm.query.indexOf(e), 1);
            }
            vm.apply();
        };

        vm.uncheckAll = function () {
            vm.query = [];
            vm.apply();
        };

        vm.apply = function () {
            vm.filterConfig.filter.updateParam(vm.queryKey, vm.query);
        };

        vm.searchOnEnter = function (event) {
            if (event.which === 13) {
                vm.typeaheadSelect(vm.selected);
            }
        };

        vm.allowSelection = function () {
            return !vm.filterConfig.singleSelect || vm.query.length == 0;
        };
    }
}

module.exports = filterCmsDirective;
