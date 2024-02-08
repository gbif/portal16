'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('filterEnum', filterEnumDirective);

/** @ngInject */
function filterEnumDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        templateUrl: '/templates/components/filterEnum/filterEnum.html?v=' + BUILD_VERSION,
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterEnum,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterEnum($scope, $http, $filter) {
        var vm = this;

        vm.filterConfig.titleTranslation;
        vm.queryKey = vm.filterConfig.queryKey;
        vm.hasFacets = vm.filterConfig.facets && vm.filterConfig.facets.hasFacets;

        vm.hasFacetSuggestions = !!vm.filterConfig.faceted;
        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);

        $scope.$watch(function() {
            return vm.filterState.query[vm.queryKey];
        }, function(newQuery) {
            vm.query = $filter('unique')(newQuery);
        });

        $scope.$watchCollection(function() {
            return vm.filterState.query;
        }, function(newState, oldState) {
            if (vm.filterConfig.facets && vm.filterConfig.facets.hasFacets && !angular.equals(newState, oldState)) {
                vm.setFacetSuggestions();
            }
        });

        vm.hideFacetCounts = false;
        vm.suggestions = {};
        vm.setFacetSuggestions = function() {
            if (vm.filterConfig.facets && vm.filterConfig.facets.hasFacets) {
                vm.hideFacetCounts = true;
                if (vm.query.length > 0 && vm.filterState.facetMultiselect.$promise) {
                    vm.filterState.facetMultiselect.$promise.then(function(data) {
                        vm.hideFacetCounts = false;
                        vm.suggestions = data.facets[vm.filterConfig.facets.facetKey];
                    });
                } else {
                    vm.filterState.data.$promise.then(function(data) {
                        vm.hideFacetCounts = false;
                        vm.suggestions = data.facets[vm.filterConfig.facets.facetKey];
                    });
                }
            }
        };
        vm.setFacetSuggestions();

        vm.searchSuggestions = [];
        vm.getSuggestions = function() {
            // if search enabled and
            if (vm.filterConfig.search && vm.filterConfig.search.isSearchable && vm.filterConfig.search.suggestEndpoint) {
                return $http.get(vm.filterConfig.search.suggestEndpoint
                ).then(function(response) {
                    vm.searchSuggestions = response.data;
                });
            }
        };
        vm.getSuggestions();

        vm.inQuery = function(name) {
            return vm.query.indexOf(name) != -1;
        };

        vm.showEnum = function(key) {
            if (vm.inQuery(key)) return true;
            if (vm.expanded) {
                if (vm.filterConfig.showAll) return true;
                if (vm.suggestions && vm.suggestions.counts && vm.suggestions.counts[key]) return true;
            }
            return false;
        };

        vm.getVisibleEnums = function() {
            return vm.filterConfig.enums.filter(function(key) {
                return vm.showEnum(key);
            });
        };

        vm.showFacetCount = function() {
            return vm.expanded && vm.filterConfig.facets && vm.filterConfig.facets.hasFacets;
        };

        vm.getWidth = function(key) {
            if (!vm.suggestions || !vm.suggestions.counts) return;
            if (!vm.showFacetCount() || !vm.filterState.data || !vm.filterState.data.count || !vm.suggestions || !vm.suggestions.counts || !vm.suggestions.counts[key]) {
                return {
                    width: '0%'
                };
            }
            var fraction = vm.suggestions.counts[key].fraction;
            var gear = 100 / (vm.suggestions.max / vm.filterState.data.count);
            var width = fraction * gear;
            return {
                width: width + '%'
            };
        };

        vm.typeaheadSelect = function(item) { //  model, label, event
            if (angular.isUndefined(item) || angular.isUndefined(item.key)) return;
            var searchString = item.key.toString();
            if (searchString !== '' && vm.query.indexOf(searchString) < 0) {
                vm.query.push(searchString);
                vm.selected = '';
                vm.apply();
            }
        };

        vm.change = function(e, checked) {
            if (checked) {
                vm.query.push(e);
            } else {
                vm.query.splice(vm.query.indexOf(e), 1);
            }
            vm.apply();
        };

        vm.uncheckAll = function() {
            vm.query = [];
            vm.apply();
        };

        // TODO test
        vm.reverse = function() {
            vm.query = _.difference(vm.getVisibleEnums(), vm.query);
            vm.apply();
        };

        vm.apply = function() {
            vm.filterConfig.filter.updateParam(vm.queryKey, vm.query);
        };

        vm.searchOnEnter = function(event) {
            if (event.which === 13) {
                vm.typeaheadSelect(vm.selected);
            }
        };

        vm.allowSelection = function() {
            return !vm.filterConfig.singleSelect || vm.query.length == 0;
        };
    }
}

module.exports = filterEnumDirective;
