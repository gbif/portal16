'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('filterDate', filterDateDirective);

/** @ngInject */
function filterDateDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterDate/filterDate.html',
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterDate,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterDate($scope, $filter) {
        var vm = this;

        vm.filterConfig.titleTranslation;
        vm.queryKey = vm.filterConfig.queryKey;
        console.log(vm.filterState.query[vm.queryKey]);
        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);

        //$scope.$watch(function () {
        //    return vm.filterState.query[vm.queryKey]
        //}, function (newQuery) {
        //    updateQuery(newQuery);
        //});

        //vm.change = function () {
        //    vm.apply();
        //};
        //
        //vm.apply = function () {
        //    vm.filterConfig.filter.updateParam(vm.queryKey, vm.query);
        //};

    }
}

module.exports = filterDateDirective;
