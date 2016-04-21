'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('datasetDetailsCtrl', datasetDetailsCtrl);

/** @ngInject */
function datasetDetailsCtrl() {
    var vm = this;
    vm.eml = {
        activeDict: [],
        latestActive: 0
    };

    vm.emlSectionToggle = function(index) {
        vm.eml.activeDict['list' + index] = !vm.eml.activeDict['list' + index];
        vm.eml.latestActive = index;
    };

    vm.emlIsActiveSection = function(index) {
        return vm.eml.activeDict['list' + index];
    };

    vm.isLatestActiveSection = function(index) {
      return vm.eml.latestActive == index;
    };
}

module.exports = datasetDetailsCtrl;