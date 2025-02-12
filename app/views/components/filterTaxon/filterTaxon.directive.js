'use strict';

var angular = require('angular'),
_ = require('lodash');

angular
    .module('portal')
    .directive('filterTaxon', filterTaxonDirective);

/** @ngInject */
function filterTaxonDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterTaxon/filterTaxon.html?v=' + BUILD_VERSION,
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
    function filterTaxon($scope, $http, $filter) {
        var vm = this;

        vm.filterConfig.titleTranslation;
        vm.queryKey = vm.filterConfig.queryKey;
        vm.hasFacets = vm.filterConfig.facets && vm.filterConfig.facets.hasFacets;
        vm.suggestKey = vm.filterConfig.search.suggestKey || 'key';

        vm.listTemplate = vm.filterConfig.listTemplate;

        vm.hasFacetSuggestions = !!vm.filterConfig.faceted;
        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);

        vm.usedKeys = {};

        $scope.$watch(function() {
            return vm.filterState.query[vm.queryKey];
        }, function(newQuery) {
            vm.query = $filter('unique')(newQuery);
            resolveAllKeys(vm.query);
        });

        $scope.$watchCollection(function() {
            return vm.filterState.query;
        }, function(newState, oldState) {
            if (vm.filterConfig.facets && vm.filterConfig.facets.hasFacets && !angular.equals(newState, oldState)) {
                vm.setFacetSuggestions();
            }
        });

        function getFullResource(key) {
            vm.filterConfig.expand.resource.get({id: key}, function(data) {
              if (typeof vm.filterConfig.search.suggestTitle === 'function') {
                vm.usedKeys[key] = vm.filterConfig.search.suggestTitle(data);
              } else {
                vm.usedKeys[key] = data[vm.filterConfig.search.suggestTitle];
              }
            });
        }

        function resolveAllKeys(list) {
            list.forEach(function(e) {
                getFullResource(e);
            });
        }

        resolveAllKeys(vm.query);

        vm.hideFacetCounts = false;
        vm.suggestions = {};
        vm.setFacetSuggestions = function() {
            if (vm.filterConfig.facets && vm.filterConfig.facets.hasFacets) {
                vm.hideFacetCounts = true;
                console.log('get suggestions');
                if (vm.query.length > 0 && vm.filterState.facetMultiselect && vm.filterState.facetMultiselect.$promise) {
                    vm.filterState.facetMultiselect.$promise.then(function(data) {
                        vm.hideFacetCounts = false;
                        vm.suggestions = data.facets[vm.filterConfig.facets.facetKey];
                        resolveAllKeys(Object.keys(vm.suggestions.counts));
                    });
                } else {
                    vm.filterState.data.$promise.then(function(data) {
                        vm.hideFacetCounts = false;
                        vm.suggestions = data.facets[vm.filterConfig.facets.facetKey];
                        resolveAllKeys(Object.keys(vm.suggestions.counts));
                    });
                }
            }
        };
        vm.setFacetSuggestions();

        vm.getSuggestions = function(val) {
            // if search enabled and
            if (vm.filterConfig.search && vm.filterConfig.search.isSearchable && vm.filterConfig.search.suggestEndpoint) {
                var defaultParams = vm.filterConfig.search.defaultParams;
                if (typeof defaultParams === 'function') {
                  defaultParams = defaultParams();
                }
                return $http.get(vm.filterConfig.search.suggestEndpoint, {
                    params: _.assign({limit: 10}, defaultParams, {
                        q: val // .toLowerCase(),
                    })
                }).then(function(response) {
                    var resultsArray = response.data;
                    if (!angular.isArray(response.data)) {
                      resultsArray = response.data.results || [];
                    }
                    return _.filter(resultsArray, function(e) {
                        return !vm.usedKeys[e[vm.suggestKey]];
                    });
                });
            }
        };

        vm.getSuggestionLabel = function(suggestion) {
            if (vm.filterConfig.search.suggestTitle && typeof vm.filterConfig.search.suggestTitle === 'function') {
                return vm.filterConfig.search.suggestTitle(suggestion);
            } else if (vm.filterConfig.search.suggestTitle) {
                return suggestion[vm.filterConfig.search.suggestTitle];
            } else {
                return suggestion || false;
            }
           // return suggestion && vm.filterConfig.search.suggestTitle ? suggestion[vm.filterConfig.search.suggestTitle] : suggestion;
        };

        vm.inQuery = function(name) {
            return vm.query.indexOf(name) != -1;
        };

        vm.showFacetCount = function() {
            return vm.expanded && vm.filterConfig.facets && vm.filterConfig.facets.hasFacets && vm.query.length != 1;
        };

        vm.getWidth = function(key) {
            var keyLower = key.toLowerCase();
            var facetKey = vm.filterConfig.facets.facetKey;
            if (!vm.showFacetCount() ||
                !vm.filterState ||
                !vm.filterState.data ||
                !vm.filterState.data.facets ||
                !vm.filterState.data.facets[facetKey] ||
                !vm.filterState.data.facets[facetKey].counts ||
                !vm.filterState.data.facets[facetKey].counts[keyLower]) {
                return {
                    width: '0%'
                };
            }
            var fraction = vm.filterState.data.facets[vm.filterConfig.facets.facetKey].counts[keyLower].fraction;
            var gear = 100 / (vm.filterState.data.facets[facetKey].max / vm.filterState.data.count);
            var width = fraction * gear;
            return {
                width: width + '%'
            };
        };

        vm.typeaheadSelect = function(item) { //  model, label, event
            if (angular.isUndefined(item) || angular.isUndefined(item[vm.suggestKey])) return;
            var searchString = item[vm.suggestKey].toString();// .toLowerCase();
            if (vm.query.indexOf(searchString) < 0) {
                vm.usedKeys[item.key] = item[vm.filterConfig.search.suggestTitle];
                vm.query.push(searchString);
                vm.selected = '';
                if (vm.filterConfig.expand) {
                    getFullResource(item[vm.suggestKey]);
                }
                vm.apply();
            }
        };

        vm.add = function(key, checked, facet) {
            vm.usedKeys[key] = facet[vm.filterConfig.search.suggestTitle];
            vm.query.push(key);
            vm.apply();
        };


        vm.remove = function(key) {
            vm.query.splice(vm.query.indexOf(key), 1);
           delete vm.usedKeys[key];
            vm.apply();
        };

        vm.useAcceptedTaxon = function(taxon) {
           vm.query.splice(vm.query.indexOf(taxon.key), 1);
           delete vm.usedKeys[taxon.key];
           vm.query.push(taxon.acceptedKey);
           getFullResource(taxon.acceptedKey);
           vm.apply();
        };

        vm.uncheckAll = function() {
            vm.query = [];
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
    }
}

module.exports = filterTaxonDirective;
