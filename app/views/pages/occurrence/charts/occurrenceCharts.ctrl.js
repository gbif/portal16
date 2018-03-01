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
    vm.api2 = {};

    vm.options = {dimension: 'basisOfRecord', type: 'BAR', filter: vm.state.query};
}

module.exports = occurrenceChartsCtrl;
