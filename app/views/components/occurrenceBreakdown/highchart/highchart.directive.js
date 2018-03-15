'use strict';

var angular = require('angular');
var _ = require('lodash');

angular
    .module('portal')
    .directive('highchart', highchartDirective);

/** @ngInject */
function highchartDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceBreakdown/highchart/highchart.html?v=' + BUILD_VERSION,
        scope: {
            config: '=',
        },
        link: highchartLink,
        controller: highchart,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function highchartLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function highchart($scope, Highcharts) {
        var vm = this;

        $scope.create = function(element) {
            vm.chartElement = element[0].querySelector('.ng_highchartArea');
            updateChart();
        };

        function updateChart() {
            if (vm.myChart) {
                vm.myChart.destroy();
                vm.myChart = undefined;
            }
            if (_.has(vm.config, 'chart')) {
                vm.config.chart.renderTo = vm.chartElement;
                if (vm.config._setChartElementSize) {
                    vm.config._setChartElementSize(vm.chartElement, vm.config);
                }
                vm.myChart = Highcharts.chart(vm.config);
            }
        }

        $scope.$watchCollection(function() {
            return vm.config;
        }, function() {
            updateChart(vm.config);
        });
    }
}

module.exports = highchartDirective;
