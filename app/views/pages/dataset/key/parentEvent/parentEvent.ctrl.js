'use strict';

var angular = require('angular'),
    utils = require('../../../../shared/layout/html/utils/utils');

require('../../../../components/map/globe/globe.directive');

angular
    .module('portal')
    .controller('datasetParentEventCtrl', datasetParentEventCtrl);

/** @ngInject */
function datasetParentEventCtrl($stateParams, Dataset, OccurrenceSearch, LOCALE) {
    var vm = this;
    vm.datasetKey = $stateParams.datasetKey;
    vm.parentEventKey = $stateParams.parentEventKey;

    // Get the core event
    vm.dataset = Dataset.get({id: vm.datasetKey});

    // get images for a gallery bar
    vm.images = OccurrenceSearch.query({dataset_key: vm.datasetKey, parent_event_id: vm.parentEventKey, media_type: 'StillImage'});
    vm.images.$promise.then(function(resp) {
        utils.attachImages(resp.results);
    });

    OccurrenceSearch.query({dataset_key: vm.datasetKey, parent_event_id: vm.parentEventKey, limit: 0})
        .$promise.then(function(res) {
            vm.occurrenceCount = res.count;
        });
    // create some charts about the event
    vm.charts = [];
    vm.pushChart = function(dimension, type, customFilter) {
        var chartConfig = {
            api: {},
            config: {dimension: dimension, secondDimension: '', type: type, showSettings: false},
            filter: {dataset_key: vm.datasetKey, parent_event_id: vm.parentEventKey, locale: LOCALE},
            customFilter: customFilter
        };
        vm.charts.push(chartConfig);
    };

    vm.pushChart('speciesKey', 'TABLE');
    vm.pushChart('eventId', 'TABLE');
}

module.exports = datasetParentEventCtrl;
