'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('datasetUsageCtrl', datasetUsageCtrl);

/** @ngInject */
function datasetUsageCtrl(DatasetDownloadStats) {
    var vm = this;
    vm.key = gb.datasetKey.key; //TODO what would be a better way to do this? an bootstraped constant possibly?
    vm.stats = {hej: 5};
    vm.state = 'LOADING';

    vm.data = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        series: [
            [5, 4, 3, 7, 5, 10, 3],
            [3, 2, 9, 5, 4, 6, 4]
        ]
    };


    vm.options = {
        seriesBarDistance: 10,
        reverseData: true,
        horizontalBars: true,
        high: 100,
        low: 0,
        axisY: {
            offset: 120
        },
        axisX: {
            labelInterpolationFnc: function (value) {
                return parseInt(value);
            }
        },
        chartPadding: {
            top: 20,
            right: 0,
            bottom: 20,
            left: 0
        },
        plugins: [
            Chartist.plugins.ctAxisTitle({
                axisX: {
                    axisTitle: 'Percentage of downloads',
                    axisClass: 'ct-axis-title',
                    offset: {
                        x: 0,
                        y: 50
                    },
                    textAnchor: 'middle'
                },
                axisY: {
                    axisTitle: 'Filter',
                    axisClass: 'ct-axis-title',
                    offset: {
                        x: 0,
                        y: 0
                    },
                    textAnchor: 'middle',
                    flipTitle: false
                }
            })
        ]
    };

    DatasetDownloadStats.get({id: vm.key}, function (response) {
        vm.stats = response;
        vm.data.labels = response.filterCounts.keys.map(function(e){
            return e.displayName;
        });
        vm.data.labels.push('No filter');
        var serie = response.filterCounts.keys.map(function (e) {
            return 100 * e.value / response.usedResults;
        });
        serie.push(response.filterCounts.noFilter);
        vm.data.series = [serie];
        vm.state = 'LOADED';
    }, function (err) {
        vm.state = 'FAILED';
        //TODO log error
    });
}

module.exports = datasetUsageCtrl;
