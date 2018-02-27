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
}

module.exports = occurrenceChartsCtrl;