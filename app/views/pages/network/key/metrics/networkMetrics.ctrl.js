'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('networkMetricsCtrl', networkMetricsCtrl);

/** @ngInject */
function networkMetricsCtrl($state, $stateParams, OccurrenceSearch, MapCapabilities) {
    var vm = this;
    vm.$state = $state;
    vm.key = $stateParams.key;
    vm.defaultCharts = [];
    vm.capabilities = MapCapabilities.get({networkKey: vm.key});
    vm.withCoordinates = OccurrenceSearch.query({
        network_key: vm.key,
        has_coordinate: true,
        has_geospatial_issue: false,
        limit: 0
    });

     function pushChart(dimension, type, secondDimension) {
        var chartConfig = {
            api: {},
            config: {dimension: dimension, secondDimension: secondDimension || '', type: type, customizable: false, showSettings: true},
            filter: {network_key: vm.key, advanced: true}
        };
        vm.defaultCharts.push(chartConfig);
    }

    pushChart('month', 'COLUMN');
    pushChart('basisOfRecord', 'PIE');
    pushChart('issue', 'TABLE');
    pushChart('year', 'LINE');
    pushChart('license', 'PIE');
    pushChart('country', 'TABLE');
}


module.exports = networkMetricsCtrl;
