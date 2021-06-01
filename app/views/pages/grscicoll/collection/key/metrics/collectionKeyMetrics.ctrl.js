'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('collectionKeyMetricsCtrl', collectionKeyMetricsCtrl);

/** @ngInject */
function collectionKeyMetricsCtrl($state, $stateParams, OccurrenceSearch, MapCapabilities) {
    var vm = this;
    vm.$state = $state;
    vm.key = $stateParams.key;
    vm.defaultCharts = [];
    vm.capabilities = MapCapabilities.get({collectionKey: vm.key});
    vm.withCoordinates = OccurrenceSearch.query({
        collection_key: vm.key,
        has_coordinate: true,
        has_geospatial_issue: false,
        limit: 0
    });

     function pushChart(dimension, type, secondDimension) {
        var chartConfig = {
            api: {},
            config: {dimension: dimension, secondDimension: secondDimension || '', type: type, customizable: false, showSettings: true},
            filter: {collection_key: vm.key, advanced: true}
        };
        vm.defaultCharts.push(chartConfig);
    }

    pushChart('datasetKey', 'TABLE');
    pushChart('publishingOrg', 'TABLE');
    pushChart('collectionCode', 'TABLE');
    pushChart('country', 'TABLE');
    pushChart('kingdomKey', 'TABLE');
    pushChart('year', 'LINE');
    pushChart('issue', 'TABLE');
}


module.exports = collectionKeyMetricsCtrl;
