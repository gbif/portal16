'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countrySummaryCtrl', countrySummaryCtrl);

/** @ngInject */
function countrySummaryCtrl($http, env, $stateParams, MapCapabilities, OccurrenceCountPublishingCountries, OccurrenceCountCountries, OccurrenceCountDatasets, Country) {
    var vm = this;
    vm.countryCode = $stateParams.key;
}

module.exports = countrySummaryCtrl;
