'use strict';

var angular = require('angular'),
    utils = require('../../../../shared/layout/html/utils/utils');

require('../../../../components/map/globe/globe.directive');

angular
    .module('portal')
    .controller('datasetEventCtrl', datasetEventCtrl);

/** @ngInject */
function datasetEventCtrl($stateParams, DatasetEvent, OccurrenceSearch, LOCALE) {
    var vm = this;
    vm.datasetKey = $stateParams.datasetKey;
    vm.eventKey = $stateParams.eventKey;

    // Get the core event
    vm.event = DatasetEvent.get({datasetKey: vm.datasetKey, eventKey: vm.eventKey});

    // get images for a gallery bar
    vm.images = OccurrenceSearch.query({dataset_key: vm.datasetKey, event_id: vm.eventKey, media_type: 'StillImage'});
    vm.images.$promise.then(function(resp) {
        utils.attachImages(resp.results);
    });

    // create some charts about the event
    vm.charts = [];
    vm.pushChart = function(dimension, type, customFilter) {
        var chartConfig = {
            api: {},
            config: {dimension: dimension, secondDimension: '', type: type, showSettings: false},
            filter: {dataset_key: vm.datasetKey, event_id: vm.eventKey, locale: LOCALE},
            customFilter: customFilter
        };
        vm.charts.push(chartConfig);
    };

    vm.pushChart('speciesKey', 'TABLE');
}

module.exports = datasetEventCtrl;
