'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryPublishingCtrl', countryPublishingCtrl);

/** @ngInject */
function countryPublishingCtrl($stateParams, DatasetSearch, OccurrenceDatasetSearch, LOCALE) {
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

    vm.charts = [];
    vm.pushChart = function(dimension, type, customFilter) {
        var chartConfig = {
            api: {},
            config: {dimension: dimension, secondDimension: '', type: type, showSettings: false},
            filter: {publishingCountry: vm.countryCode, locale: LOCALE},
            customFilter: customFilter
        };
        vm.charts.push(chartConfig);
    };

    vm.pushChart('month', 'COLUMN');
    vm.pushChart('basisOfRecord', 'PIE');
    vm.pushChart('country', 'TABLE');
    vm.pushChart('year', 'LINE', {year: '1950,*'});
    vm.pushChart('license', 'PIE');
    vm.pushChart('datasetKey', 'TABLE');
}

module.exports = countryPublishingCtrl;
