'use strict';

let angular = require('angular');

angular
    .module('portal')
    .controller('countryTrendsCtrl', countryTrendsCtrl);

/** @ngInject */
function countryTrendsCtrl() {
    // var vm = this;
}

module.exports = countryTrendsCtrl;
