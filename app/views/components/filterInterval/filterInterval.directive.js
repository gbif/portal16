'use strict';

var angular = require('angular');
require('./intervalSlider.directive');
var parseIntervalQuery = require('./parseIntervalQuery');


angular
    .module('portal')
    .directive('filterInterval', filterIntervalDirective);

/** @ngInject */
function filterIntervalDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterInterval/filterInterval.html?v=' + BUILD_VERSION,
        scope: {
            filterState: '=',
            filterConfig: '=',
            filterType: '@'
        },
        replace: true,
        controller: filterInterval,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterInterval($scope, $filter) {
        var vm = this;
        vm.filter = vm.filterConfig.filter;
        vm.queryKey = vm.filterConfig.queryKey;
        vm.title = vm.filterConfig.title || vm.filterConfig.queryKey;
        vm.translationPrefix = vm.filterConfig.translationPrefix || vm.filterConfig.queryKey;
        vm.collapsed = vm.filterConfig.collapsed !== false;
        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);

        vm.remove = function(el) {
            var start = vm.intervalQuery.indexOf(el);
            if (start >= 0) {
                vm.intervalQuery.splice(start, 1);
            }
            if (vm.intervalQuery.length == 0) {
                vm.add();
            }
            vm.apply();
        };

        vm.add = function(intervalStr) {
            vm.intervalQuery = vm.intervalQuery || [];
            vm.intervalQuery.push(
                {
                    queryString: intervalStr,
                    inActive: typeof(intervalStr) === 'undefined',
                    change: function() {
                        vm.apply();
                    },
                    remove: vm.remove,
                    range: vm.filterConfig.range,
                    step: vm.filterConfig.step,
                    numberType: vm.filterType ? vm.filterType : 'int', // expects 'float' or 'int'
                    intervalTranslation: vm.filterConfig.intervalTranslation
                }
            );
        };

        vm.intervalQuery = [];
        vm.add();

        $scope.$watch(function() {
            return vm.filterState.query[vm.queryKey];
        }, function(newQuery, oldQuery) {
            if (!angular.equals(newQuery, oldQuery)) {
                vm.setFromState();
            }
        });

        vm.setFromState = function() {
            vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);
            vm.intervalQuery = [];
            vm.query.forEach(function(e) {
                vm.add(e);
            });
            if (vm.intervalQuery.length == 0) {
                vm.add();
            }
        };
        vm.setFromState();

        vm.uncheckAll = function() {
            vm.intervalQuery = [];
            vm.add();
            vm.apply();
        };

        vm.getParsedQuery = function(query) {
            var interval = parseIntervalQuery(query);
            return interval;
        };

        vm.apply = function() {
            vm.query = [];
            vm.intervalQuery.forEach(function(e) {
                if (typeof e.queryString !== 'undefined') {
                    vm.query.push(e.queryString);
                }
            });
            vm.filter.updateParam(vm.queryKey, vm.query);
        };
    }
}


module.exports = filterIntervalDirective;
