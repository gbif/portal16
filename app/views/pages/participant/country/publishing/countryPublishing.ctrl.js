'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('countryPublishingCtrl', countryPublishingCtrl);

/** @ngInject */
function countryPublishingCtrl($stateParams, DatasetSearch, OccurrenceDatasetSearch) {
    var vm = this;
    vm.countryCode = $stateParams.key;

    DatasetSearch.query({publishing_country: vm.countryCode}, function(data) {
        vm.datasetsFrom = data;
    }, function() {
        // TODO handle request error
    });

    OccurrenceDatasetSearch.query({publishing_country: vm.countryCode, facet: 'dataset_key'}, function(data) {
        vm.occurrenceDatasetsFrom = data;
    }, function() {
        // TODO handle request error
    });
}

module.exports = countryPublishingCtrl;
