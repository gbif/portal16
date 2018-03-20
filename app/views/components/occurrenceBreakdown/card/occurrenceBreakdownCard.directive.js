'use strict';

var angular = require('angular');
var _ = require('lodash');
var chartOptions = require('../config');

require('../occurrenceBreakdown.directive');
require('../header/occurrenceBreakdownHeader.directive');
require('../settings/occurrenceBreakdownSettings.directive');

angular
    .module('portal')
    .directive('occurrenceBreakdownCard', occurrenceBreakdownCardDirective);

/** @ngInject */
function occurrenceBreakdownCardDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceBreakdown/card/occurrenceBreakdownCard.html?v=' + BUILD_VERSION,
        scope: {
            api: '=',
            config: '=',
            filter: '=',
            chartChange: '=',
            customFilter: '='
        },
        controller: occurrenceBreakdownCard,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function occurrenceBreakdownCard($scope) {
        var vm = this;
        vm.chartApi = {};
        if (vm.chartChange) {
            vm.chartApi.chartChange = function() {
                var state = {
                    dimension: vm.options.dimension,
                    secondDimension: vm.options.secondDimension,
                    type: vm.display.type
                };
                vm.chartChange(state);
            };
        }
        vm.chartOptions = chartOptions;
        vm.options = {
            dimension: vm.config.dimension,
            secondDimension: vm.config.secondDimension,
            limit: vm.config.limit || 10,
            offset: vm.config.offset || 0
        };

        vm.display = {showSettings: vm.config.customizable && vm.config.showSettings, type: vm.config.type || 'TABLE', customizable: vm.config.customizable};

        vm.isSupported = function(type) {
            if (vm.chartApi.getDimension) {
                return chartOptions.supportedTypes[vm.chartApi.getDimension()].indexOf(type) > -1;
            } else {
                return false;
            }
        };

        vm.nextPage = function() {
            vm.options.offset = vm.options.offset + vm.options.limit;
        };

        vm.prevPage = function() {
            vm.options.offset = Math.max(0, vm.options.offset - vm.options.limit);
        };

        function setMergedFilter() {
            vm.mergedFilter = _.assign({}, _.get(vm, 'filter'), _.get(vm, 'customFilter'));
        }
        vm.mergedFilter = setMergedFilter();

        /* WATCH FILTERS FOR CHANGES */
        $scope.$watchCollection(function() {
            return vm.filter;
        }, function() {
            setMergedFilter();
        });

        vm.getState = function() {
            console.log(vm.options);
            console.log(vm.display);
            return vm.options;
        };

        if (vm.api) {
            vm.api.getState = function() {
                return vm.getState();
            };
        }
    }
}

module.exports = occurrenceBreakdownCardDirective;
