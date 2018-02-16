'use strict';

let angular = require('angular');

angular
    .module('portal')
    .controller('countrySummaryCtrl', countrySummaryCtrl);

/** @ngInject */
function countrySummaryCtrl($stateParams) {
    let vm = this;
    vm.countryCode = $stateParams.key;
}

module.exports = countrySummaryCtrl;
