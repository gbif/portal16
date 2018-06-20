'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('datasetProjectCtrl', datasetProjectCtrl);

/** @ngInject */
function datasetProjectCtrl($stateParams, DatasetExtended) {
    var vm = this;
    vm.key = $stateParams.key;
    vm.dataset = DatasetExtended.get({key: vm.key});
}

module.exports = datasetProjectCtrl;
