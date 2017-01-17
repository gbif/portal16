'use strict';

var angular = require('angular'),
    parseIntervalQuery = require('./parseIntervalQuery');

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
            intervalOptions: '='
        },
        replace: true,
        controller: intervalSlider,
        controllerAs: 'vm',
        bindToController: true
    };


    return directive;

    /** @ngInject */
    function intervalSlider($scope) {
        var vm = this;
        vm.form = {};
        vm.options = ['between', 'is', 'lessThan', 'largerThan'];
        vm.selected = vm.options[0];

        vm.intervalOptions.range = vm.intervalOptions.range || {
            'min': [1000, 1],
            '10%': [1700, 1],
            '50%': [1960, 1],
            'max': [new Date().getFullYear()]
        };

        vm.sliderOptions = {
            start: [vm.intervalOptions.range.min, vm.intervalOptions.range.max],
            range: vm.intervalOptions.range,
            format: {
                to: function (value) {
                    return parseInt(value)
                },
                from: function (value) {
                    return parseInt(value)
                }
            },
            step: 1,
            connect: true
        };

        vm.eventHandlers = {
            //update: function(values, handle, unencoded) {
            //},
            slide: function (values) { //values, handle, unencoded
                vm.intervalOptions.inActive = undefined;
                vm.from = values[0];
                vm.to = values[1];
            },
            //set: function(values, handle, unencoded) {
            //},
            change: function () { //, handle, unencoded
                vm.apply();
            }
        };

        vm.parseQueryString = function (str) {
            var interval = parseIntervalQuery(str);
            if (interval) {
                if (interval.type == 'is') {
                    vm.sliderOptions.start = interval.values;
                    vm.setType(vm.options[1])
                } else if (interval.type == 'between') {
                    vm.sliderOptions.start = interval.values;
                    vm.setType(vm.options[0])
                } else if (interval.type == 'lessThan') {
                    vm.sliderOptions.start = interval.values;
                    vm.setType(vm.options[2])
                } else if (interval.type == 'largerThan') {
                    vm.sliderOptions.start = interval.values;
                    vm.setType(vm.options[3])
                }
            }
        };

        $scope.$watchCollection(function () {
            return vm.intervalOptions
        }, function (newState, oldState) {
            if (newState.queryString !== oldState.queryString) {
                vm.parseQueryString(newState.queryString);
            }
        });

        vm.setType = function (choice) {
            vm.selected = choice;
            switch (vm.selected) {
                case 'between':
                    vm.sliderOptions.connect = true;
                    if (typeof vm.sliderOptions.start[0] === 'undefined') {
                        vm.sliderOptions.start[0] = vm.sliderOptions.range.min;
                    }
                    if (typeof vm.sliderOptions.start[1] === 'undefined') {
                        vm.sliderOptions.start[1] = vm.sliderOptions.range.max;
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
                default:
                    vm.query = '';
            }
            vm.from = vm.sliderOptions.start[0];
            vm.to = vm.sliderOptions.start[1];
        };

        vm.selectType = function (choice) {
            vm.setType(choice);
            vm.apply();
        };
        vm.isValid = function () {
            return vm.form.$valid;// && (vm.tester.start[0] && vm.tester.start[1]);
        };
        //vm.uncheckAll = function() {
        //    vm.sliderOptions.start[0] = parseInt(vm.sliderOptions.range.min);
        //    vm.sliderOptions.start[1] = parseInt(vm.sliderOptions.range.max);
        //    vm.from = '';
        //    vm.to = '';
        //};

        vm.changeFrom = function () {
            if (vm.form.from && !vm.form.from.$valid) {
                vm.sliderOptions.start[0] = parseInt(vm.sliderOptions.range.min);
            } else {
                vm.sliderOptions.start[0] = vm.from;
            }
        };
        vm.changeTo = function () {
            if (vm.form.to && !vm.form.to.$valid) {
                vm.sliderOptions.start[1] = parseInt(vm.sliderOptions.range.max);
            } else {
                vm.sliderOptions.start[1] = vm.to;
            }
        };

        vm.blurFrom = function () {
            if (!vm.form.from.$valid) {
                vm.from = vm.sliderOptions.start[0];
            }
            vm.apply();
        };

        vm.blurTo = function () {
            if (!vm.form.to.$valid) {
                vm.to = vm.sliderOptions.start[1];
            }
            vm.apply();
        };

        vm.remove = function () {
            if (angular.isFunction(vm.intervalOptions.remove)) {
                vm.intervalOptions.remove(vm.intervalOptions);
            }
        };

        vm.apply = function () {
            var stateString = '';
            vm.intervalOptions.inActive = undefined;
            vm.changeFrom();
            vm.changeTo();
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
            vm.intervalOptions.queryString = stateString;
            if (angular.isFunction(vm.intervalOptions.change)) {
                vm.intervalOptions.change(stateString);
            }
        };
        vm.parseQueryString(vm.intervalOptions.queryString);
    }
}

module.exports = intervalSliderDirective;
