'use strict';

var angular = require('angular');
require('./intervalSlider.directive');

angular
    .module('portal')
    .directive('filterInterval', filterIntervalDirective);

/** @ngInject */
function filterIntervalDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterInterval/filterInterval.html',
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterInterval,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterInterval($scope, $filter, OccurrenceFilter) {
        var vm = this;

        vm.state = {
            queryString: '1900',
            change: function(val){
                console.log('CHANGED ' + val);
            }
        };

        vm.remove = function(el) {
            var start = vm.intervalQuery.indexOf(el);
            if (start >= 0) {
                if (vm.intervalQuery.length == 1) {
                    vm.intervalQuery[0].isActive = false;
                } else {
                    vm.intervalQuery.splice(start, 1);
                }
            }
        }


        vm.add = function() {
            vm.intervalQuery = vm.intervalQuery || [];
            vm.intervalQuery.push(
                {
                    queryString: '1900',
                    change: function(val){
                        console.log('CHANGED ' + val);
                    },
                    remove: vm.remove,
                    isActive: false
                }
            );
        };

        vm.intervalQuery = [];
        vm.add();

        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.translationPrefix = vm.filterConfig.translationPrefix || vm.filterConfig.title;
        vm.collapsed = vm.filterConfig.collapsed !== false;

        vm.query = $filter('unique')(vm.filterState.query[vm.title]);

        $scope.$watch(function(){return vm.filterState.query[vm.title]}, function(newQuery){
            vm.query = $filter('unique')(newQuery);
        });

        vm.uncheckAll = function() {
            vm.intervalQuery = [
                {
                    queryString: '1900',
                    change: function(val){
                        console.log('CHANGED ' + val);
                    },
                    remove: vm.remove,
                    isActive: false
                }
            ];
        };

        vm.apply = function() {
            console.log('APPLY');
        }
    }
}

module.exports = filterIntervalDirective;
