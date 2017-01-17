'use strict';

var angular = require('angular'),
    parseDateQuery = require('./parseDateIntervalQuery');

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
    function filterDate($scope, $filter, enums) {
        var vm = this;
        vm.months = enums.month;
        vm.options = ['between', 'is', 'lessThan', 'largerThan'];
        vm.selected = vm.options[0];

        vm.filterConfig.titleTranslation;
        vm.queryKey = vm.filterConfig.queryKey;

        var dates = parseDateQuery(vm.filterState.query[vm.queryKey]);
        vm.type = dates.type;
        vm.fromDate = dates.values[0] || {};
        vm.toDate = dates.values[1] || {}

        //$scope.$watch(function () {
        //    return vm.filterState.query[vm.queryKey]
        //}, function (newQuery) {
        //    updateQuery(newQuery);
        //});

        //vm.change = function () {
        //    vm.apply();
        //};
        //
        
        vm.apply = function () {
           vm.filterConfig.filter.updateParam(vm.queryKey, vm.query);
        };

    }
}

module.exports = filterDateDirective;
