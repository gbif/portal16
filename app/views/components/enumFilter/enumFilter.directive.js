'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('enumFilter', enumFilterDirective);

/** @ngInject */
function enumFilterDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/enumFilter/enumFilter.html',
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: enumFilter,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function enumFilter($scope, $filter, OccurrenceFilter) {
        var vm = this;
        vm.enumValues = vm.filterConfig.enumValues;
        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.translationPrefix = vm.filterConfig.translationPrefix || vm.filterConfig.title;
        vm.filterAutoUpdate = vm.filterConfig.filterAutoUpdate !== false;
        vm.collapsed = vm.filterConfig.collapsed !== false;

        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);


        vm.checkboxModel = {
            'HUMAN_OBSERVATION' : true,
            'OBSERVATION' : 'YES'
        }

        function setModel(query) {
            vm.enumValues.forEach(function(e){
                vm.checkboxModel[e] = false;
            });
            vm.query.forEach(function(e){
                vm.checkboxModel[e] = true;
            });
        }
        setModel(vm.query);

        vm.reverse = function() {
            vm.enumValues.forEach(function(key){
                vm.checkboxModel[key] = !vm.checkboxModel[key];
            });
            vm.apply();
        };

        vm.uncheckAll = function() {
            vm.enumValues.forEach(function(key){
                vm.checkboxModel[key] = false;
            });
            vm.apply();
        };

        vm.apply = function() {
            if (vm.filterAutoUpdate) {
                vm.query = vm.enumValues.filter(function(e){
                    return !!vm.checkboxModel[e];
                });
                OccurrenceFilter.updateParam(vm.queryKey, vm.query);
            }
        }

        $scope.$watch(function(){return vm.filterState.query[vm.queryKey]}, function(newQuery){
            vm.query = $filter('unique')(newQuery);
            setModel(vm.query);
        });
    }
}

module.exports = enumFilterDirective;
