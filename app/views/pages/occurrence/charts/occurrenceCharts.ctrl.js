'use strict';

var angular = require('angular');
var _ = require('lodash');

require('../../../components/occurrenceBreakdown/card/occurrenceBreakdownCard.directive');

angular
    .module('portal')
    .controller('occurrenceChartsCtrl', occurrenceChartsCtrl);

/** @ngInject */
function occurrenceChartsCtrl(OccurrenceFilter, $httpParamSerializer, $sessionStorage, $state) {
    var vm = this;
    vm.state = OccurrenceFilter.getOccurrenceData();
    vm.charts = [];
    vm.$httpParamSerializer = $httpParamSerializer;
    vm.defaultCharts = [];
    vm.$sessionStorage = $sessionStorage;
    vm.$sessionStorage.occurrenceChartsShowDefaults = _.get(vm.$sessionStorage, 'occurrenceChartsShowDefaults', true);

    vm.hasData = function() {
        return typeof vm.state.table.count !== 'undefined';
    };

    vm.pushChart = function(dimension, type, secondDimension, chartlist, customizable, customFilter, limit) {
        var list = chartlist || vm.charts;
        var chartConfig = {
            api: {},
            config: {dimension: dimension, secondDimension: secondDimension || '', type: type, customizable: customizable, showSettings: true, limit: limit},
            filter: vm.state.query,
            customFilter: customFilter
        };
        list.push(chartConfig);
    };

    vm.pushChart('month', 'COLUMN', null, vm.defaultCharts);
    vm.pushChart('basisOfRecord', 'PIE', null, vm.defaultCharts);
    vm.pushChart('issue', 'TABLE', null, vm.defaultCharts);
    vm.pushChart('year', 'LINE', '', vm.defaultCharts);
    vm.pushChart('license', 'PIE', null, vm.defaultCharts);
    vm.pushChart('dataset_key', 'TABLE', null, vm.defaultCharts);

    vm.setCustomChart = function() {
        var state = _.get($sessionStorage, 'customChart', {});
        vm.customChart = {
            api: {},
            config: {
                dimension: state.dimension,
                secondDimension: state.secondDimension,
                type: state.type || 'TABLE',
                customizable: true,
                showSettings: true
            },
            filter: vm.state.query
        };
    };
    vm.setCustomChart();

    vm.getStates = function() {
        console.log('get states');
        var a = vm.charts.map(function(e) {
            return e.api.getState();
        });
        console.log(a);
    };

    vm.chartChange = function(state) {
        $sessionStorage.customChart = state;
        vm.setCustomChart();
    };

    vm.getSerializedQuery = function() {
        var query = angular.copy(vm.state.query);
        delete query.locale;
        delete query.advanced;
        query = _.omitBy(query, angular.isUndefined);
        return $httpParamSerializer(query);
    };
}

module.exports = occurrenceChartsCtrl;
