'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('machineVisionCtrl', machineVisionCtrl);

/** @ngInject */
function machineVisionCtrl(Page, $state) {
    var vm = this;
    vm.$state = $state;
}

module.exports = machineVisionCtrl;
