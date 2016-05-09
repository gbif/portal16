'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('verticalTabularRendererCtrl', verticalTabularRendererCtrl);

/** @ngInject */
function verticalTabularRendererCtrl() {
    var vm = this;
    vm.elements = {
        activeDict: [],
        latestActive: 0
    };

    vm.sectionToggle = function(index) {
        vm.elements.activeDict['list' + index] = !vm.elements.activeDict['list' + index];
        vm.elements.latestActive = index;
    };

    vm.isActiveSection = function(index) {
        return vm.elements.activeDict['list' + index];
    };

    vm.isLatestActiveSection = function(index) {
      return vm.elements.latestActive == index;
    };
}

module.exports = verticalTabularRendererCtrl;