'use strict';
var angular = require('angular');
require('../../../components/occurrenceBreakdown/card/occurrenceBreakdownCard.directive');

angular
    .module('portal')
    .controller('occurrenceChartsCtrl', occurrenceChartsCtrl);

/** @ngInject */
function occurrenceChartsCtrl(OccurrenceFilter) {
    var vm = this;
    vm.state = OccurrenceFilter.getOccurrenceData();
    vm.charts = [];

    vm.hasData = function() {
        return typeof vm.state.table.count !== 'undefined';
    };

    vm.pushChart = function() {
        vm.charts.push({
            api: {},
            options: {dimension: '', secondDimension: '', type: 'TABLE', filter: vm.state.query}
        });
    };
    vm.pushChart();
}

module.exports = occurrenceChartsCtrl;
