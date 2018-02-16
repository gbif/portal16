'use strict';

let angular = require('angular');

angular
    .module('portal')
    .controller('datasetProjectCtrl', datasetProjectCtrl);

/** @ngInject */
function datasetProjectCtrl($stateParams, DatasetExtended) {
    let vm = this;
    vm.key = $stateParams.key;
    vm.dataset = DatasetExtended.get({key: vm.key});
}

module.exports = datasetProjectCtrl;
