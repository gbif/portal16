'use strict';
var angular = require('angular');
require('./contactsNav');

angular
    .module('portal')
    .controller('directoryCtrl', directoryCtrl);

/** @ngInject */
function directoryCtrl() {
    var vm = this;
    vm.hiddenDetail = true;
    vm.toggleStatus = {};
    vm.toggleDetail = function(personId) {
        // true means show
        if (vm.toggleStatus[personId] && vm.toggleStatus[personId] == 'contact--show') {
            vm.toggleStatus[personId] = false;
        }
        else {
            vm.toggleStatus[personId] = 'contact--show';
        }
    };
}

module.exports = directoryCtrl;