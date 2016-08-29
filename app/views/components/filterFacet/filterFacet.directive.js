'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('filterFacet', filterFacetDirective);

/** @ngInject */
function filterFacetDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterFacet/filterFacet.html',
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterFacet,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterFacet($scope, $filter) {
        var vm = this;
        vm.filterAutoUpdate = true;
        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.facetKey = vm.filterConfig.facetKey;
        vm.collapsed = vm.filterConfig.collapsed !== false;

        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);
        vm.filterConfig.enumValues = vm.query;
        vm.checkboxModel = {};
        vm.facets = {};

        function setModel(query) {
            query.forEach(function(e){
                vm.checkboxModel[e] = true;
            });
        }
        setModel(vm.query);

        vm.getOptions = function(a, b) {
            var options = {};
            b = b || [];
            if (a) {
                b.concat(a).forEach(function(e){
                    options[e.name] = e;
                });
            }
            return options;
        };

        vm.showFacetCount = function() {
            return vm.facetKey && !vm.collapsed && vm.query.length != 1;
        };

        vm.reverse = function() {
            vm.filterConfig.enumValues.forEach(function(key){
                vm.checkboxModel[key] = !vm.checkboxModel[key];
            });
            vm.apply();
        };

        vm.uncheckAll = function() {
            vm.filterConfig.enumValues.forEach(function(key){
                vm.checkboxModel[key] = false;
            });
            vm.apply();
        };

        vm.apply = function() {
            if (vm.filterAutoUpdate) {
                vm.query = [];
                Object.keys(vm.checkboxModel).forEach(function(key){
                    if (vm.checkboxModel[key]) {
                        vm.query.push(key);
                    } 
                });
                vm.filterConfig.filter.updateParam(vm.queryKey, vm.query);
            }
        };

        $scope.$watch(function(){return vm.filterState.query[vm.queryKey]}, function(newQuery){
            vm.query = $filter('unique')(newQuery);
            setModel(vm.query);
        });

        // $scope.$watch(function(){return vm.filterState.data}, function(newQuery){
        //     vm.query = $filter('unique')(newQuery);
        //     setModel(vm.query);
        // });

    }
}

module.exports = filterFacetDirective;
