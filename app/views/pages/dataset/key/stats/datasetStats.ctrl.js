'use strict';

var angular = require('angular');

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

}

module.exports = datasetStatsCtrl;