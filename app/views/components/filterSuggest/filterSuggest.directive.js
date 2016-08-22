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
            filterQuery: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterSuggest,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterSuggest($http, $filter, suggestEndpoints) {
        var vm = this;

        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.translationPrefix = vm.filterConfig.translationPrefix || 'ocurrenceFieldNames';
        vm.filterAutoUpdate = vm.filterConfig.filterAutoUpdate || false;
        vm.suggestEndpoint = vm.filterConfig.suggestEndpoint || suggestEndpoints[vm.queryKey];
        vm.collapsed = vm.filterConfig.collapsed === false ? false : true;

        vm.filterQuery[vm.queryKey] = $filter('unique')(vm.filterQuery[vm.queryKey]);

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
            if (vm.filterQuery[vm.queryKey].indexOf(item.toString()) < 0) {
                vm.filterQuery[vm.queryKey].push(item.toString());
                vm.selected = '';
            }
        };

        vm.uncheckAll = function() {
            vm.filterQuery[vm.queryKey] = [];
        };
    }
}

module.exports = filterSuggestDirective;
