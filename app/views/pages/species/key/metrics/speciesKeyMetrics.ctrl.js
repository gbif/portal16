'use strict';

var angular = require('angular');


angular
    .module('portal')
    .controller('speciesKeyMetricsCtrl', speciesKeyMetricsCtrl);

/** @ngInject */
// eslint-disable-next-line max-len
function speciesKeyMetricsCtrl($stateParams, LOCALE, $httpParamSerializer) {
    var vm = this;
    vm.key = $stateParams.speciesKey;
    vm.charts = [];
    vm.$httpParamSerializer = $httpParamSerializer;
    vm.defaultCharts = [];
    vm.pushChart = function(dimension, type, secondDimension, chartlist, customizable, customFilter, limit) {
        var list = chartlist || vm.charts;
        var chartConfig = {
            api: {},
            config: {dimension: dimension, secondDimension: secondDimension || '', type: type, customizable: customizable, showSettings: true, limit: limit},
            filter: {taxon_key: vm.key, locale: LOCALE},
            customFilter: customFilter
        };
        list.push(chartConfig);
    };

    vm.pushChart('month', 'COLUMN', null, vm.defaultCharts);
    vm.pushChart('year', 'LINE', '', vm.defaultCharts);
    vm.pushChart('basisOfRecord', 'PIE', null, vm.defaultCharts);
    vm.pushChart('country', 'COLUMN', null, vm.defaultCharts);
    vm.pushChart('dataset_key', 'TABLE', null, vm.defaultCharts);


    vm.getStates = function() {
        console.log('get states');
        var a = vm.charts.map(function(e) {
            return e.api.getState();
        });
        console.log(a);
    };


    vm.getSerializedQuery = function() {
        return $httpParamSerializer({taxon_key: vm.key});
    };
}

module.exports = speciesKeyMetricsCtrl;
