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
    function filterTaxon($scope, $state, $http, $filter, OccurrenceFilter) {
        var vm = this;
        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.facetKey = vm.filterConfig.facetKey;
        vm.translationPrefix = vm.filterConfig.translationPrefix || vm.filterConfig.title;
        vm.filterAutoUpdate = vm.filterConfig.filterAutoUpdate !== false;
        vm.collapsed = vm.filterConfig.collapsed !== false;

        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);

        vm.usedKeys = {};

        $scope.$watch(function(){return vm.filterState.query[vm.queryKey]}, function(newQuery){
            vm.query = $filter('unique')(newQuery);
            resolveAllKeys();
        });

        function getFullResource(key) {
            vm.filterConfig.resource.get({id: key}, function(data){
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
            var params = angular.copy(vm.filterConfig.defaultParams);
            params.q = val;
            params.limit = 10;
            return $http.get(vm.filterConfig.suggestEndpoint, {
                params: params
            }).then(function(response){
                return response.data;
            });
        };

        vm.typeaheadSelect = function(item){ //  model, label, event
            if (vm.query.indexOf(item.key.toString()) < 0) {
                vm.usedKeys[item.key] = item;
                vm.query.push(item.key.toString());
                vm.selected = '';
                if (vm.filterConfig.expand) {
                    getFullResource(item.key);
                }   
                vm.apply();
            }
        };

        vm.uncheckAll = function() {
            vm.query = [];
            vm.apply();
        };
        vm.apply = function() {
            OccurrenceFilter.updateParam(vm.queryKey, vm.query);
        };
    }
}

module.exports = filterTaxonDirective;
