'use strict';

var angular = require('angular');
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
        vm.options = ['between', 'is', 'lessThan', 'largerThan'];
        vm.selected = vm.options[0];

        vm.sliderOptions = {
            start: [1700, 2016],
            range: {
                'min': [ 1700, 1 ],
                '50%': [ 1950, 1 ],
                'max': [ 2016 ]
            },
            format: {
                to: function ( value ) {
                    return parseInt(value)
                },
                from: function ( value ) {
                    return parseInt(value)
                }
            },
            step: 1,
            connect: true
        };
        //vm.sliderSingle = {
        //    connect: false
        //};

        vm.eventHandlers = {
            update: function(values, handle, unencoded) {
            },
            slide: function(values, handle, unencoded) {
                vm.from = values[0];
                vm.to = values[1];
                vm.isActive = true;
            },
            set: function(values, handle, unencoded) {
            },
            change: function(values, handle, unencoded) {
                vm.apply();
            }
        };

        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.translationPrefix = vm.filterConfig.translationPrefix || vm.filterConfig.title;
        vm.collapsed = vm.filterConfig.collapsed !== false;

        vm.query = $filter('unique')(vm.filterState.query[vm.title]);



        $scope.$watch(function(){return vm.filterState.query[vm.title]}, function(newQuery){
            vm.query = $filter('unique')(newQuery);
        });

        vm.selectType = function(choice) {
            vm.selected = choice;
            switch(vm.selected) {
                case 'between':
                    vm.sliderOptions.connect = true;
                    vm.sliderOptions.start[1] = vm.sliderOptions.range.max;
                    if (vm.sliderOptions.start[0] >= vm.sliderOptions.range.max) {
                        vm.sliderOptions.start[1] = parseInt(vm.sliderOptions.range.max);
                        vm.sliderOptions.start[0] = parseInt(vm.sliderOptions.range.min);
                    }
                    break;
                case 'is':
                    vm.sliderOptions.connect = false;
                    if (isFinite(vm.sliderOptions.start[1])) {
                        vm.sliderOptions.start = [parseInt(vm.sliderOptions.start[1])];
                    } else if (isFinite(vm.sliderOptions.start[0])) {
                        vm.sliderOptions.start = [parseInt(vm.sliderOptions.start[0])];
                    } else {
                        vm.sliderOptions.start = [parseInt(vm.sliderOptions.range.min)];
                    }
                    break;
                case 'lessThan':
                    vm.sliderOptions.connect = 'lower';
                    if (isFinite(vm.sliderOptions.start[1])) {
                        vm.sliderOptions.start = [parseInt(vm.sliderOptions.start[1])];
                    } else if (isFinite(vm.sliderOptions.start[0])) {
                        vm.sliderOptions.start = [parseInt(vm.sliderOptions.start[0])];
                    } else {
                        vm.sliderOptions.start = [parseInt(vm.sliderOptions.range.max)];
                    }
                    break;
                case 'largerThan':
                    vm.sliderOptions.connect = 'upper';
                    if (isFinite(vm.sliderOptions.start[0])) {
                        vm.sliderOptions.start = [parseInt(vm.sliderOptions.start[0])];
                    } else {
                        vm.sliderOptions.start = [parseInt(vm.sliderOptions.range.min)];
                    }
                    break;
                default: vm.query = '';
            }
            vm.isActive = true;
            vm.apply();
        };
        vm.isValid = function() {
            return vm.form.$valid;// && (vm.tester.start[0] && vm.tester.start[1]);
        };
        vm.uncheckAll = function() {
            vm.isActive = false;
            OccurrenceFilter.updateParam('year', '');
            vm.sliderOptions.start[0] = parseInt(vm.sliderOptions.range.min);
            vm.sliderOptions.start[1] = parseInt(vm.sliderOptions.range.max);
            vm.from = '';
            vm.to = '';
        };

        vm.changeFrom = function() {
            if (!vm.form.from.$valid) {
                vm.sliderOptions.start[0] = parseInt(vm.sliderOptions.range.min);
            } else {
                vm.isActive = true;
                vm.sliderOptions.start[0] = vm.from;
            }
        };
        vm.changeTo = function() {
            if (!vm.form.to.$valid) {
                vm.sliderOptions.start[1] = parseInt(vm.sliderOptions.range.max);
            } else {
                vm.isActive = true;
                vm.sliderOptions.start[1] = vm.to;
            }
        };

        vm.blurFrom = function() {
            if (!vm.form.from.$valid && vm.isActive) {
                vm.from = vm.sliderOptions.start[0];
            }
        };

        vm.blurTo = function() {
            if (!vm.form.to.$valid && vm.isActive) {
                vm.to = vm.sliderOptions.start[1];
            }
        };

        vm.apply = function() {
            if (vm.form.$valid) {
                switch (vm.selected) {
                    case 'between':
                        vm.query = vm.sliderOptions.start[0] + ',' + vm.sliderOptions.start[1];
                        break;
                    case 'is':
                        vm.query = vm.sliderOptions.start[0];
                        break;
                    case 'lessThan':
                        vm.query = '*,' + vm.sliderOptions.start[0];
                        break;
                    case 'largerThan':
                        vm.query = vm.sliderOptions.start[0] + ',*';
                        break;
                    default:
                        vm.query = '';
                }
                OccurrenceFilter.updateParam('year', vm.query);
            } else {
                OccurrenceFilter.updateParam('year', '');
            }
        }
    }
}

module.exports = filterIntervalDirective;
