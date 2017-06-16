'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryPublishingCtrl', countryPublishingCtrl);

/** @ngInject */
function countryPublishingCtrl($stateParams) {
    var vm = this;
    vm.countryCode = $stateParams.key;
}

module.exports = countryPublishingCtrl;
