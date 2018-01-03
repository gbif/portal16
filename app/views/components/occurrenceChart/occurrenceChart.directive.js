'use strict';


var angular = require('angular'),
    _ = require('lodash');

require('./occurrenceChart.resource');

angular
    .module('portal')
    .directive('occurrenceChart', occurrenceChartDirective);

/** @ngInject */
function occurrenceChartDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceChart/occurrenceChart.html?v=' + BUILD_VERSION,
        scope: {
            filter: '=',
            chartOptions: '='
        },
        link: chartLink,
        controller: occurrenceChart,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function chartLink(scope, element) {//, attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function occurrenceChart($scope, $timeout, OccurrenceChartBasic, Highcharts) {
        var vm = this;

        $scope.create = function (element) {
            console.log('create');
            var chartElement= element[0].querySelector('.chartArea');

            OccurrenceChartBasic.query({chartDimension: 'year', facetLimit:100}).$promise
                .then(function(data){
                    var myChart = Highcharts.chart(chartElement, {
                        chart: {
                            type: 'bar'
                        },
                        bar: {
                            minPointLength: 10
                        },
                        title: {
                            text: data.title
                        },
                        xAxis: {
                            categories: data.categories
                        },
                        yAxis: {
                            title: {
                                text: 'Occurrence count'
                            },
                            //type: 'logarithmic',
                            minorTickInterval: 1
                        },
                        series: [{
                            data: data.series[0].data
                        }]
                    });
                });

        };

        //$scope.$watchCollection(function () {
        //    return vm.filter
        //}, function () {
        //    //do something when the filter is updated
        //});
    }
}

//var options = {
//    fields: {
//        basis_of_record:
//    }
//};



/**
 * OVERALL IDEA
 * for any occ filter.
 * define a field of a fixed subset (BoR, year, month, species?, latitude? decade? ...)
 * depending on type a fixed number of chart types.
 * Basically simlpy filter as is. add facet as per selected field. If key, then resolve. could start with only allowing enums.
 * defaults to bar chart. doughnut if single value per type. BoR or kingdom fx. Issue not.
 * for bar charts only?: similar to table layout: if several species (or another type) selected, then do breakdown per type? months fx. so basically. choose field (say months). defaults to counts per month, but option to choose counts per other field per month - fx selected species or all of an enum
 *
 *
 * CHART TYPES
 * bar chart.
 * pie.
 * map country chloropleth
 * ¿ plain list ? seems useful for issues fx (almost just a vertical bar chart).
 * table. choose additional dimension. At least one enum (else we cannot write 'other'). iterate enums and add to filter (overwrite enum filter if already there)) and facet per other dimension. also do a plain facet on enum diff is other.
 *
 * MORE
 * more button for more facets (increase facetLimit). always ask for one more facet than asked for to decide on showing more button.
 *
 * INTERACTIVE
 * labels optional clickable to add as filter.
 *
 * SPECIAL CASES
 * taxonomy special case. interactive widget.
 * Years (and elevation and other continuous numbers) seem special as well in that you would typically want them not ordered by count, but in order.
 *
 * Years (and other continuous nr)
 * seems tricky. How to handle this?
 * Start by asking for facets with a large number, say 500. If there are more, then find extend first by asking for extremes and dividing in half?
 * Then select an appropriate interval?
 * Then filter per interval to get counts.
 *
 * fullscreen? download image/pdf? download csv data? how about citation then?
 *
 */

module.exports = occurrenceChartDirective;
