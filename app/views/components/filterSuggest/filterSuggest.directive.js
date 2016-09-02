'use strict';

var angular = require('angular');

angular
    .module('portal')
    .directive('filterSuggest', filterSuggestDirective);

/** @ngInject */
function filterSuggestDirective() {
    var directive = {
        restrict: 'A',
        templateUrl: '/templates/components/filterSuggest/filterSuggest.html',
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterSuggest,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterSuggest($scope, $http, $filter, suggestEndpoints, OccurrenceFilter) {
        var vm = this;

        vm.filterConfig.titleTranslation;
        vm.queryKey = vm.filterConfig.queryKey;
        vm.hasFacets = vm.filterConfig.facets && vm.filterConfig.facets.hasFacets;


        vm.hasFacetSuggestions = !!vm.filterConfig.faceted;
        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);

        $scope.$watch(function(){return vm.filterState.query[vm.queryKey]}, function(newQuery){
            vm.query = $filter('unique')(newQuery);
        });

        $scope.$watch(function(){return vm.filterState.data}, function(newQuery){
            //newQuery.$promise.then(vm.getFacetSuggestions);
        });

        $scope.$watchCollection(function(){return vm.filterState.query}, function(newState, oldState){
            if (vm.filterConfig.facets && vm.filterConfig.facets.hasFacets && !angular.equals(newState, oldState)) {
                vm.setFacetSuggestions();
            }
        });

        vm.facetSuggestions = {};
        vm.setFacetSuggestions = function() {
            if (vm.filterConfig.facets && vm.filterConfig.facets.hasFacets) {
                vm.filterState.facetMultiselect.$promise.then(function (data) {
                    vm.facetSuggestions = data.facets[vm.filterConfig.facets.facetKey];
                });
            };
        };
        vm.setFacetSuggestions();

        vm.getSuggestions = function(val) {
            //if search enabled and
            if (vm.filterConfig.search && vm.filterConfig.search.isSearchable && vm.filterConfig.search.suggestEndpoint) {
                return $http.get(vm.filterConfig.search.suggestEndpoint, {
                    params: {
                        q: val,
                        limit: 10
                    }
                }).then(function (response) {
                    return response.data;
                });
            }
        };

        vm.inQuery = function(name){
            return vm.query.indexOf(name) != -1;
        };

        vm.showFacetCount = function() {
            return vm.filterConfig.expanded && vm.filterConfig.facets && vm.filterConfig.facets.hasFacets && vm.query.length != 1;
        };

        vm.getWidth = function(key) {
            var facetKey = vm.filterConfig.facets.facetKey;
            if ( !vm.showFacetCount() || !vm.filterState || !vm.filterState.data || !vm.filterState.data.facets || !vm.filterState.data.facets[facetKey] || !vm.filterState.data.facets[facetKey].counts || !vm.filterState.data.facets[facetKey].counts[key]) {
                return {
                    width: '0%'
                }
            }
            var fraction = vm.filterState.data.facets[vm.filterConfig.facets.facetKey].counts[key].fraction;
            var gear = 100 / (vm.filterState.data.facets[facetKey].max / vm.filterState.data.count);
            var width = fraction * gear;
            return {
                width: width + '%'
            };
        };

        vm.typeaheadSelect = function(item){ //  model, label, event
            if (angular.isUndefined(item)) return;
            var searchString = item.toString();
            if (searchString !== '' && vm.query.indexOf(searchString) < 0) {
                vm.query.push(item.toString());
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

        vm.apply = function() {
            OccurrenceFilter.updateParam(vm.queryKey, vm.query);
        };

        vm.searchOnEnter = function(event) {
            if(event.which === 13) {
                vm.typeaheadSelect(vm.selected);
            }
        };
    }
}

module.exports = filterSuggestDirective;
