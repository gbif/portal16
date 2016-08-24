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
            filterTitle: '@',
            filterState: '=',
            filterCollapsed: '=',
            filterAutoUpdate: '='
        },
        replace: true,
        controller: filterTaxon,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterTaxon($scope, $state, $http, $filter, Species, suggestEndpoints, OccurrenceFilter) {
        var vm = this;
        vm.usedKeys = {};
        vm.query = $filter('unique')(vm.filterState.query[vm.filterTitle]);

        $scope.$watch(function(){return vm.filterState.query[vm.filterTitle]}, function(newQuery){
            vm.query = $filter('unique')(newQuery);
            resolveAllKeys();
        });

        function getFullResource(key) {
            Species.get({id: key}, function(data){
                vm.usedKeys[key] = data;
            });
        }

        function resolveAllKeys() {
            vm.query.forEach(function(e){
                getFullResource(e);
            });    
        }
        resolveAllKeys();
        

        vm.change = function(e, checked) {
            if (checked) {
                vm.query.push(e);
            } else {
                vm.query.splice(vm.query.indexOf(e), 1);
            }
            vm.apply();
        };

        vm.getSuggestions = function(val) {
            return $http.get(suggestEndpoints.species, {
                params: {
                    q: val,
                    limit: 10,
                    datasetKey: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'
                }
            }).then(function(response){
                return response.data;
            });
        };

        vm.typeaheadSelect = function(item){ //  model, label, event
            if (vm.query.indexOf(item.key.toString()) < 0) {
                vm.usedKeys[item.key] = item;
                vm.query.push(item.key.toString());
                vm.selected = '';
                getFullResource(item.key);
                vm.apply();
            }
        };

        vm.uncheckAll = function() {
            vm.query = [];
            vm.apply();
        };
        vm.apply = function() {
            OccurrenceFilter.updateParam(vm.filterTitle, vm.query);
        };
    }
}

module.exports = filterTaxonDirective;
