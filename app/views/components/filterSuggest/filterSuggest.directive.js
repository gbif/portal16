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

        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.translationPrefix = vm.filterConfig.translationPrefix || 'ocurrenceFieldNames';
        vm.filterAutoUpdate = vm.filterConfig.filterAutoUpdate === false ? false : true;
        vm.suggestEndpoint = vm.filterConfig.suggestEndpoint || suggestEndpoints[vm.title];
        vm.collapsed = vm.filterConfig.collapsed === false ? false : true;

        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);

        $scope.$watch(function(){return vm.filterState.query[vm.queryKey]}, function(newQuery){
            vm.query = $filter('unique')(newQuery);
        });

        vm.getSuggestions = function(val) {
            return $http.get(vm.suggestEndpoint, {
                params: {
                    q: val,
                    limit: 10
                }
            }).then(function(response){
                return response.data;
            });
        };

        vm.typeaheadSelect = function(item){ //  model, label, event
            if (angular.isUndefined(item)) return;
            var searchString = item.toString();
            if (searchString !== '' && vm.query.indexOf(searchString) < 0) {
                vm.query.push(item.toString());
                vm.selected = '';
                if (vm.filterAutoUpdate) {
                    vm.apply();
                }
            }
        };

        vm.change = function(e, checked) {
            if (vm.filterAutoUpdate) {
                if (checked) {
                    vm.query.push(e);
                } else {
                    vm.query.splice(vm.query.indexOf(e), 1);
                }
                vm.apply();
            }
        };

        vm.uncheckAll = function() {
            vm.query = [];
            if (vm.filterAutoUpdate) {
                vm.apply();
            }
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
