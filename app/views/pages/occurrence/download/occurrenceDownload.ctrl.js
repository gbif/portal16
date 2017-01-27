/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceDownloadCtrl', occurrenceDownloadCtrl);

/** @ngInject */
function occurrenceDownloadCtrl(OccurrenceFilter) {
    var vm = this;
    vm.occurrenceState = OccurrenceFilter.getOccurrenceData();
}

module.exports = occurrenceDownloadCtrl;
