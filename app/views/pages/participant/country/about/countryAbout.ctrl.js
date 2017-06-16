'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryAboutCtrl', countryAboutCtrl);

/** @ngInject */
function countryAboutCtrl($stateParams) {
    var vm = this;
    vm.countryCode = $stateParams.key;
}

module.exports = countryAboutCtrl;
