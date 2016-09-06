'use strict';

var angular = require('angular');

angular
    .module('portal')
    .directive('filterTaxon', filterTaxonDirective);

/** @ngInject */
function filterTaxonDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterTaxon/filterTaxon.html',
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterTaxon,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterTaxon($scope, $http, $filter, OccurrenceFilter) {
        var vm = this;

        vm.filterConfig.titleTranslation;
        vm.queryKey = vm.filterConfig.queryKey;
        vm.hasFacets = vm.filterConfig.facets && vm.filterConfig.facets.hasFacets;

        vm.listTemplate = vm.filterConfig.listTemplate ? vm.filterConfig.listTemplate : '/templates/components/filterSuggest/basicSuggest.html';

        vm.hasFacetSuggestions = !!vm.filterConfig.faceted;
        vm.query = $filter('uniqueLower')(vm.filterState.query[vm.queryKey]);

        vm.usedKeys = {};

        $scope.$watch(function(){return vm.filterState.query[vm.queryKey]}, function(newQuery){
            vm.query = $filter('uniqueLower')(newQuery);
            resolveAllKeys();
        });

        $scope.$watchCollection(function(){return vm.filterState.query}, function(newState, oldState){
            if (vm.filterConfig.facets && vm.filterConfig.facets.hasFacets && !angular.equals(newState, oldState)) {
                vm.setFacetSuggestions();
            }
        });

        function getFullResource(key) {
            vm.filterConfig.expand.resource.get({id: key}, function(data){
                vm.usedKeys[key] = data[vm.filterConfig.expand.expandedTitle];
            });
        }

        function resolveAllKeys() {
            vm.query.forEach(function(e){
                getFullResource(e);
            });
        }
        resolveAllKeys();

        vm.facetSuggestions = {};
        vm.setFacetSuggestions = function() {
            if (vm.filterConfig.facets && vm.filterConfig.facets.hasFacets) {
                vm.filterState.facetMultiselect.$promise.then(function (data) {
                    vm.facetSuggestions = data.facets[vm.filterConfig.facets.facetKey];
                });
            }
        };
        vm.setFacetSuggestions();

        vm.getSuggestions = function(val) {
            //if search enabled and
            if (vm.filterConfig.search && vm.filterConfig.search.isSearchable && vm.filterConfig.search.suggestEndpoint) {
                return $http.get(vm.filterConfig.search.suggestEndpoint, {
                    params: {
                        q: val.toLowerCase(),
                        limit: 10
                    }
                }).then(function (response) {
                    return response.data;
                });
            }
        };

        vm.getSuggestionLabel = function(suggestion) {
            return suggestion && vm.filterConfig.search.suggestTitle ? suggestion[vm.filterConfig.search.suggestTitle] : suggestion;
        };

        vm.inQuery = function(name){
            return vm.query.indexOf(name) != -1;
        };

        vm.showFacetCount = function() {
            return vm.filterConfig.expanded && vm.filterConfig.facets && vm.filterConfig.facets.hasFacets && vm.query.length != 1;
        };

        vm.getFacetCount = function(key){
            var count = vm.filterState.data.facets[vm.filterConfig.facets.facetKey].counts[key].count
        };

        vm.getWidth = function(key) {
            var keyLower = key.toLowerCase();
            var facetKey = vm.filterConfig.facets.facetKey;
            if ( !vm.showFacetCount() || !vm.filterState || !vm.filterState.data || !vm.filterState.data.facets || !vm.filterState.data.facets[facetKey] || !vm.filterState.data.facets[facetKey].counts || !vm.filterState.data.facets[facetKey].counts[keyLower]) {
                return {
                    width: '0%'
                }
            }
            var fraction = vm.filterState.data.facets[vm.filterConfig.facets.facetKey].counts[keyLower].fraction;
            var gear = 100 / (vm.filterState.data.facets[facetKey].max / vm.filterState.data.count);
            var width = fraction * gear;
            return {
                width: width + '%'
            };
        };

        vm.typeaheadSelect = function(item){ //  model, label, event
            if (angular.isUndefined(item) || angular.isUndefined(item.key)) return;
            var searchString = item.key.toString().toLowerCase();
            if (vm.query.indexOf(searchString) < 0) {
                vm.usedKeys[item.key] = item[vm.filterConfig.search.suggestTitle];
                vm.query.push(searchString);
                vm.selected = '';
                if (vm.filterConfig.expand) {
                    getFullResource(item.key);
                }
                vm.apply();
            }
        };

        vm.add = function(key, checked, facet) {
            vm.usedKeys[key] = facet[vm.filterConfig.search.suggestTitle];
            vm.query.push(key);
            vm.apply();
        };


        vm.remove = function(key, checked) {
            vm.query.splice(vm.query.indexOf(key), 1);
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

module.exports = filterTaxonDirective;
