'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryAboutCtrl', countryAboutCtrl);

/** @ngInject */
function countryAboutCtrl($stateParams, OccurrenceTableSearch, OccurrenceDatasetSearch, LOCALE) {
    var vm = this;
    vm.countryCode = $stateParams.key;

    OccurrenceDatasetSearch.query({country: vm.countryCode}, function(data) {
        vm.datasetsAbout = data;
    }, function() {
        // TODO handle request error
    });

    vm.charts = [];
    vm.pushChart = function(dimension, type, customFilter) {
        var chartConfig = {
            api: {},
            config: {dimension: dimension, secondDimension: '', type: type, showSettings: false},
            filter: {country: vm.countryCode, locale: LOCALE},
            customFilter: customFilter
        };
        vm.charts.push(chartConfig);
    };

    vm.pushChart('month', 'COLUMN');
    vm.pushChart('basisOfRecord', 'PIE');
    vm.pushChart('publishingCountry', 'TABLE');
    vm.pushChart('year', 'LINE', {year: '1950,*'});
    vm.pushChart('license', 'PIE');
    vm.pushChart('datasetKey', 'TABLE');
}

module.exports = countryAboutCtrl;
