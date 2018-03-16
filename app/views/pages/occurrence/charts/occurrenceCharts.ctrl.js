'use strict';

var angular = require('angular');
var _ = require('lodash');

require('../../../components/occurrenceBreakdown/card/occurrenceBreakdownCard.directive');

angular
    .module('portal')
    .controller('occurrenceChartsCtrl', occurrenceChartsCtrl);

/** @ngInject */
function occurrenceChartsCtrl(OccurrenceFilter, $httpParamSerializer, $sessionStorage) {
    var vm = this;
    vm.state = OccurrenceFilter.getOccurrenceData();
    vm.charts = [];
    vm.$httpParamSerializer = $httpParamSerializer;
    vm.defaultCharts = [];
    console.log($sessionStorage.occurrenceChartsShowDefaults);
    vm.$sessionStorage = $sessionStorage;
    $sessionStorage.occurrenceChartsShowDefaults = true;// $sessionStorage.occurrenceChartsShowDefaults || true;

    vm.hasData = function() {
        return typeof vm.state.table.count !== 'undefined';
    };

    vm.pushChart = function(dimension, type, secondDimension, chartlist, customizable) {
        var list = chartlist || vm.charts;
        list.push({
            api: {},
            config: {dimension: dimension, secondDimension: secondDimension || '', type: type, customizable: customizable, showSettings: true},
            filter: vm.state.query
        });
    };

    vm.pushChart('month', 'PIE', null, vm.defaultCharts);
    vm.pushChart('issue', 'TABLE', null, vm.defaultCharts);
    vm.pushChart('country', 'COLUMN', 'basisOfRecord', vm.defaultCharts);
    vm.pushChart('decimalLatitude', 'TABLE', '', vm.defaultCharts);

    vm.pushChart('', 'TABLE', '', vm.charts, true);

    vm.getStates = function() {
        console.log('get states');
        var a = vm.charts.map(function(e) {
            return e.api.getState();
        });
        console.log(a);
    };

    vm.getSerializedQuery = function() {
        var query = angular.copy(vm.state.query);
        delete query.locale;
        query = _.omitBy(query, _.isEmpty);
        return $httpParamSerializer(query);
    };
}

module.exports = occurrenceChartsCtrl;
