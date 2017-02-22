'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('userSettingsCtrl', userSettingsCtrl);

/** @ngInject */
function userSettingsCtrl(User) {
    var vm = this;
    vm.test = 'hej';
}

module.exports = userSettingsCtrl;

