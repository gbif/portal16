'use strict';

let angular = require('angular');

angular
    .module('portal')
    .controller('datasetProjectCtrl', datasetProjectCtrl);

/** @ngInject */
function datasetProjectCtrl($stateParams) {
    let vm = this;
    vm.key = $stateParams.key;
}

module.exports = datasetProjectCtrl;
