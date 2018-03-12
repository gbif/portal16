'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceChartsCtrl', occurrenceChartsCtrl);

/** @ngInject */
function occurrenceChartsCtrl(OccurrenceFilter) {
    var vm = this;
    vm.state = OccurrenceFilter.getOccurrenceData();

    vm.api = {};
    vm.options = {dimension: 'month', secondDimension: 'basisOfRecord', type: 'BAR', filter: vm.state.query};

    vm.hasData = function() {
        return typeof vm.state.table.count !== 'undefined';
    };
}

module.exports = occurrenceChartsCtrl;
