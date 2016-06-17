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
    .controller('datasetCtrl', datasetCtrl);

/** @ngInject */
function datasetCtrl() {
    var vm = this;
    vm.test = 'hej dataset page';
}

module.exports = datasetCtrl;