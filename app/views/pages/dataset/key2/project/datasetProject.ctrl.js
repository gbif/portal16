'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('datasetTaxonomyCtrl', datasetTaxonomyCtrl);

/** @ngInject */
function datasetTaxonomyCtrl($stateParams, DatasetExtended) {
    var vm = this;
    vm.key = $stateParams.key;
    vm.dataset = DatasetExtended.get({key:vm.key});
}

module.exports = datasetTaxonomyCtrl;
