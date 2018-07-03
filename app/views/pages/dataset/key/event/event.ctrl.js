'use strict';

var angular = require('angular'),
    utils = require('../../../../shared/layout/html/utils/utils');

require('../../../../components/map/globe/globe.directive');
require('../parentEvent/parentEvent.ctrl');


angular
    .module('portal')
    .controller('datasetEventCtrl', datasetEventCtrl);

/** @ngInject */
function datasetEventCtrl($stateParams, DatasetEvent, DatasetEventList, OccurrenceSearch, $http, LOCALE) {
    var vm = this;
    vm.datasetKey = $stateParams.datasetKey;
    vm.eventKey = $stateParams.eventKey;
    // Get the core event
    vm.event = DatasetEvent.get({datasetKey: vm.datasetKey, eventKey: vm.eventKey});

    // Get first page of paginated events - currently from the proxy API that use occurrence facets to estimate it.  This is not ideal, but a fragile workaround
    vm.changeEventPage = function(offset) {
        vm.event.$promise.then(function() {
            var q = {datasetKey: vm.datasetKey, offset: offset, limit: 10};
            if (vm.event.parentEventID) {
                q.parentEventID = vm.event.parentEventID;
            }
            return DatasetEventList.query(q).$promise;
        }).then(function(response) {
            vm.hasSiblings = vm.hasSiblings || response.results.length > 1;
            vm.siblingEvents = response;
        }).catch(function() {
            // ignore and use promise for user feedback instead
        });
    };
    vm.changeEventPage(0);

    // get total event count if below proxy apis threshold (1000 at time of writing)
    vm.event.$promise.then(function() {
        var url = '/api/dataset/' + vm.datasetKey + '/eventCount';
        if (vm.event.parentEventID) {
            url += '?parentEventID=' + vm.event.parentEventID;
        }
        return $http.get(url);
    }).then(function(response) {
        vm.siblingCount = response.data.endOfRecords ? response.data.count - 1 : undefined;
    })
        .catch(function() {
            // ignore
        });

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
