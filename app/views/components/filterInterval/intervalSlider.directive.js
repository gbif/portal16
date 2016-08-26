'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('intervalSlider', intervalSliderDirective);

/** @ngInject */
function intervalSliderDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterInterval/intervalSlider.html',
        scope: {
            intervalOptions: '=',
        },
        replace: true,
        controller: intervalSlider,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function intervalSlider($scope, $filter, OccurrenceFilter) {
        var vm = this;
        vm.intervalOptions.isActive = false;
        vm.options = ['between', 'is', 'lessThan', 'largerThan'];
        vm.selected = vm.options[0];
        $scope.$watchCollection(function(){return vm.intervalOptions}, function(val){
            if (vm.intervalOptions.isActive === false) {
                vm.uncheckAll();
            }
        });
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
                vm.intervalOptions.isActive = true;
            },
            set: function(values, handle, unencoded) {
            },
            change: function(values, handle, unencoded) {
                vm.apply();
            }
        };

        // $scope.$watch(function(){return vm.filterState.query[vm.title]}, function(newQuery){
        //     vm.query = $filter('unique')(newQuery);
        // });

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
            vm.intervalOptions.isActive = true;
            vm.apply();
        };
        vm.isValid = function() {
            return vm.form.$valid;// && (vm.tester.start[0] && vm.tester.start[1]);
        };
        vm.uncheckAll = function() {
            vm.intervalOptions.isActive = false;
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
                vm.intervalOptions.isActive = true;
                vm.sliderOptions.start[0] = vm.from;
            }
        };
        vm.changeTo = function() {
            if (!vm.form.to.$valid) {
                vm.sliderOptions.start[1] = parseInt(vm.sliderOptions.range.max);
            } else {
                vm.intervalOptions.isActive = true;
                vm.sliderOptions.start[1] = vm.to;
            }
        };

        vm.blurFrom = function() {
            if (!vm.form.from.$valid && vm.intervalOptions.isActive) {
                vm.from = vm.sliderOptions.start[0];
            }
        };

        vm.blurTo = function() {
            if (!vm.form.to.$valid && vm.intervalOptions.isActive) {
                vm.to = vm.sliderOptions.start[1];
            }
        };

        vm.remove = function() {
            if (angular.isFunction(vm.intervalOptions.remove)) {
                vm.intervalOptions.remove(vm.intervalOptions);
            }
        };

        vm.apply = function() {
            var stateString = '';
            if (vm.form.$valid) {
                switch (vm.selected) {
                    case 'between':
                        stateString = vm.sliderOptions.start[0] + ',' + vm.sliderOptions.start[1];
                        break;
                    case 'is':
                        stateString = vm.sliderOptions.start[0];
                        break;
                    case 'lessThan':
                        stateString = '*,' + vm.sliderOptions.start[0];
                        break;
                    case 'largerThan':
                        stateString = vm.sliderOptions.start[0] + ',*';
                        break;
                    default:
                        stateString = '';
                }
            }
            vm.intervalOptions.queryString = stateString;
            if (angular.isFunction(vm.intervalOptions.change)) {
                vm.intervalOptions.change(stateString);
            }
        }
    }
}

module.exports = intervalSliderDirective;
