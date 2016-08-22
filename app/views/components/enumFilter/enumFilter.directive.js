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
            filterQuery: '=',
            filterConfig: '='
        },
        replace: true,
        controller: enumFilter,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function enumFilter($state, $filter) {
        var vm = this;
        vm.enumValues = vm.filterConfig.enumValues;
        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.translationPrefix = vm.filterConfig.translationPrefix || vm.filterConfig.title;
        vm.filterAutoUpdate = vm.filterConfig.filterAutoUpdate || false;
        vm.collapsed = vm.filterConfig.collapsed === false ? false : true;

        vm.filterQuery[vm.title] = $filter('unique')(vm.filterQuery[vm.title]);

        vm.change = function(e, checked) {
            if (vm.filterAutoUpdate) {
                if (checked) {
                    vm.filterQuery[vm.title].push(e);
                } else {
                    vm.filterQuery[vm.title].splice(vm.filterQuery[vm.title].indexOf(e), 1);
                }
                vm.apply();
            }
        };
        vm.reverse = function() {
            vm.filterQuery[vm.title] =  vm.enumValues.filter(function(e){
                return vm.filterQuery[vm.title].indexOf(e) == -1;
            });
        };
        vm.uncheckAll = function() {
            vm.filterQuery[vm.title] = [];
        };
        vm.apply = function() {
            $state.go('.', vm.filterQuery, {inherit: false, notify: true, reload: true});
        }
    }
}

module.exports = enumFilterDirective;
