'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('datasetProjectCtrl', datasetProjectCtrl);

/** @ngInject */
function datasetProjectCtrl($stateParams) {
    var vm = this;
    vm.key = $stateParams.key;
}

module.exports = datasetProjectCtrl;
