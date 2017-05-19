'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('datasetKey2Ctrl', datasetKey2Ctrl);

/** @ngInject */
function datasetKey2Ctrl($stateParams) {
    var vm = this;
    vm.bibExpand = {
        isExpanded: false
    };
    vm.key = $stateParams.key;
}

module.exports = datasetKey2Ctrl;
