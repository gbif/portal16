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
    function filterDate($scope, $filter) {
        var vm = this;
        vm.months = [1,2,3,4,5,6,7,8,9,10,11,12];
        vm.options = ['between', 'is', 'lessThan', 'largerThan'];
        vm.intervals = [];

        vm.filterConfig.titleTranslation;
        vm.queryKey = vm.filterConfig.queryKey;

        vm.intervals = $filter('unique')(vm.filterState.query[vm.queryKey]);
        vm.dates = {};//parseDateQuery(vm.filterState.query[vm.queryKey]);

        //$scope.$watch(function () {
        //    return vm.filterState.query[vm.queryKey]
        //}, function (newQuery) {
        //    updateQuery(newQuery);
        //});

        vm.getParsedQuery = function(query) {
            var interval = parseDateQuery(query);
            return interval;
        };

        vm.selectType = function(selectedIntervalType) {
            if (vm.options.indexOf(selectedIntervalType) < 0) {
                vm.dates.type = vm.options[1];
                vm.clearCurrent();
            } else {
                vm.dates.type = selectedIntervalType;
            }
            vm.stringifyQuery();
        };

        vm.clearCurrent = function () {
            vm.dates.from = {};
            vm.dates.to = {};
            vm.queryString = undefined;
        };

        vm.clear = function () {
            vm.intervals = [];
            vm.clearCurrent();
            vm.apply();
        };

        vm.add = function() {
            var queryString = vm.stringifyQuery();
            if (queryString) {
                vm.intervals.push(queryString);
                vm.clearCurrent();
                vm.apply();
            }
        };

        vm.change = function () {
            vm.stringifyQuery();
        };

        function pad(n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }

        function getDatePart(date) {
            if (!date) {
                return undefined;
            } else {
                return date.year + '-' + pad(date.month,2);
            }
        }

        vm.stringifyQuery = function(){
            var reg = /^[\d\-\*,]+$/;
            var stateString = '',
                fromStr = getDatePart(vm.dates.from),
                toStr = getDatePart(vm.dates.to);
            switch (vm.dates.type) {
                case 'between':
                    stateString = fromStr + ',' + toStr;
                    break;
                case 'is':
                    stateString = fromStr;
                    break;
                case 'lessThan':
                    stateString = '*,' + fromStr;
                    break;
                case 'largerThan':
                    stateString = fromStr + ',*';
                    break;
                default:
                    stateString = '';
            }
            vm.queryString = reg.test(stateString) ? stateString : false;
            return vm.queryString;
        };

        vm.selectType(vm.dates.type);

        vm.remove = function (el) {
            var start = vm.intervals.indexOf(el);
            if (start >= 0) {
                vm.intervals.splice(start, 1);
            }
            vm.apply();
        };

        vm.apply = function () {
           vm.filterConfig.filter.updateParam(vm.queryKey, vm.intervals);
        };

    }
}

module.exports = filterDateDirective;
