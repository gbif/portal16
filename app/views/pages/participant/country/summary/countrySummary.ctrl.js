'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countrySummaryCtrl', countrySummaryCtrl);

/** @ngInject */
function countrySummaryCtrl($stateParams) {
    var vm = this;
    vm.countryCode = $stateParams.key;
}

module.exports = countrySummaryCtrl;
