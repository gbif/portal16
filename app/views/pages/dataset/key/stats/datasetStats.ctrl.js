'use strict';

var angular = require('angular');
require('./directives/checklistTaxonomyStats.directive.js');

angular
    .module('portal')
    .controller('datasetStatsCtrl', datasetStatsCtrl);

/** @ngInject */
function datasetStatsCtrl($http, $stateParams, env, endpoints, DatasetMetrics, Highcharts) {
    var vm = this;
    vm.key = $stateParams.key;

    vm.checklistMetrics = DatasetMetrics.get({key: vm.key});

    vm.getDownloads = function () {
        vm.loadingDownloads = true;
        vm.failedToLoadDownloads = false;
        var downloads = $http.get(env.dataApi + endpoints.datasetDownloads + vm.key, {params: {limit: vm.limit, offset: vm.offset, locale: $stateParams.locale}});
        downloads.then(function (response) {
            vm.loadingDownloads = false;
            vm.downloads = response.data;
        }, function () {
            vm.loadingDownloads = false;
            vm.failedToLoadDownloads = true;
        });
    };
    vm.getDownloads();

    /**
     * OVERALL IDEA
     * for any occ filter.
     * define a field of a fixed subset (BoR, year, month, species?, ...)
     * depending on type a fixed number of chart types.
     * Basically simlpy filter as is. add facet as per selected field. If key, then resolve. could start with only allowing enums.
     * defaults to bar chart. donught if single value per type. BoR or kingdom fx. Issue not.
     *
     * CHART TYPES
     * bar chart.
     * pie.
     * plain list? seems useful for issues fx (almost just a vertical bar chart).
     * table. choose additional dimension. At least one enum (else we cannot write other). iterate enums and add to filter (ovwewrite enum filter if already there)) and facet per other dimension. also do a plain facet on enum diff is other.
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
     *
     *
     */

    angular.element(document).ready(function () {
        var myChart = Highcharts.chart('container', {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Fruit Consumption'
            },
            xAxis: {
                categories: ['Apples', 'Bananas', 'Oranges']
            },
            yAxis: {
                title: {
                    text: 'Fruit eaten'
                }
            },
            series: [{
                name: 'Jane',
                data: [1, 0, 4]
            }, {
                name: 'John',
                data: [5, 7, 3]
            }]
        });
    });



}

module.exports = datasetStatsCtrl;