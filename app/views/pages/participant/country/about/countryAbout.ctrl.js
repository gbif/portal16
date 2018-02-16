'use strict';

let angular = require('angular');

angular
    .module('portal')
    .controller('countryAboutCtrl', countryAboutCtrl);

/** @ngInject */
function countryAboutCtrl($stateParams, OccurrenceTableSearch, OccurrenceDatasetSearch) {
    let vm = this;
    vm.countryCode = $stateParams.key;

    OccurrenceDatasetSearch.query({country: vm.countryCode}, function(data) {
        vm.datasetsAbout = data;
    }, function() {
        // TODO handle request error
    });
}

module.exports = countryAboutCtrl;
