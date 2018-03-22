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
            config: '='
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

        $scope.$on('$destroy', function() {
            if (vm.myChart) {
                vm.myChart.destroy();
            }
            // Silly thing, but Highcharts isn't clearing its internal store of charts. Which for a single page angular app is an unfortunate memory hog
            // one should think we could just always remove undefined from the array as they suggest https://github.com/highcharts/highcharts/issues/2431
            // but doing so will leave subsequent calls to Highcharts.charts empty
            if (Highcharts.chartCount === 0) {
                _.remove(Highcharts.charts, _.isUndefined);
            }
        });

        function updateChart() {
            if (vm.myChart) {
                vm.myChart.destroy();
                vm.myChart = undefined;
            }
            if (_.has(vm.config, 'chart')) {
                vm.config.chart.renderTo = vm.chartElement;
                if (vm.config._setChartElementSize) {
                    vm.config._setChartElementSize(vm.chartElement, vm.config);
                } else {
                    vm.chartElement.style.width = '100%';
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
