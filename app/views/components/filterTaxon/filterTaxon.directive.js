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
            filterQuery: '=',
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
    function filterTaxon($state, $http, $filter, Species, suggestEndpoints) {
        var vm = this;
        vm.usedKeys = {};

        vm.filterQuery[vm.filterTitle] = $filter('unique')(vm.filterQuery[vm.filterTitle]);

        function getFullResource(key) {
            Species.get({id: key}, function(data){
                vm.usedKeys[key] = data;
            });
        }

        vm.filterQuery[vm.filterTitle].forEach(function(e){
            getFullResource(e);
        });

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
            if (vm.filterQuery[vm.filterTitle].indexOf(item.key.toString()) < 0) {
                vm.usedKeys[item.key] = item;
                vm.filterQuery[vm.filterTitle].push(item.key.toString());
                vm.selected = '';
                getFullResource(item.key);
            }
        };

        vm.uncheckAll = function() {
            vm.filterQuery[vm.filterTitle] = [];
        };
        vm.apply = function() {
            $state.go('.', vm.filterQuery, {inherit: false, notify: true, reload: true});
        };
    }
}

module.exports = filterTaxonDirective;
