'use strict';

var angular = require('angular'),
    utils = require('../../../../shared/layout/html/utils/utils');

require('../../../../components/map/globe/globe.directive');

angular
    .module('portal')
    .controller('datasetParentEventCtrl', datasetParentEventCtrl);

/** @ngInject */
function datasetParentEventCtrl($stateParams, DatasetEventList, Dataset, Publisher, OccurrenceSearch, $http, LOCALE) {
    var vm = this;
    vm.datasetKey = $stateParams.datasetKey;
    vm.parentEventKey = $stateParams.parentEventKey;

    // Get the core event
    vm.dataset = Dataset.get({id: vm.datasetKey});
    vm.dataset.$promise.then(function() {
        return Publisher.get({id: vm.dataset.publishingOrganizationKey});
    }).then(function(publisher) {
        vm.publisher = publisher;
    }).catch(function() {
        // No publisher, that was odd
    });
    // get images for a gallery bar
    vm.images = OccurrenceSearch.query({dataset_key: vm.datasetKey, parent_event_id: vm.parentEventKey, media_type: 'StillImage'});
    vm.images.$promise.then(function(resp) {
        utils.attachImages(resp.results);
    });

    vm.occurrences = OccurrenceSearch.query({dataset_key: vm.datasetKey, parent_event_id: vm.parentEventKey, limit: 0});
    vm.images.$promise.then(function(resp) {
        utils.attachImages(resp.results);
    });
    vm.withCoordinates = OccurrenceSearch.query({
        dataset_key: vm.key,
        parent_event_id: vm.parentEventKey,
        has_coordinate: true,
        has_geospatial_issue: false,
        limit: 0
    });
    vm.withoutTaxon = OccurrenceSearch.query({dataset_key: vm.datasetKey, parent_event_id: vm.parentEventKey, issue: 'TAXON_MATCH_NONE', limit: 0});
    vm.withYear = OccurrenceSearch.query({dataset_key: vm.datasetKey, parent_event_id: vm.parentEventKey, year: '*,3000', limit: 0});

        // Get first page of paginated events - currently from the proxy API that use occurrence facets to estimate it.  This is not ideal, but a fragile workaround
        vm.changeEventPage = function(offset) {
            var q = {datasetKey: vm.datasetKey, parentEventID: vm.parentEventKey, offset: offset, limit: 10};
             DatasetEventList.query(q).$promise.then(function(response) {
                vm.hasChildren = vm.hasChildren || response.results.length > 0;
                vm.childEvents = response;
            }).catch(function() {
                // ignore and use promise for user feedback instead
            });
        };
        vm.changeEventPage(0);

    // get total event count if below proxy apis threshold (1000 at time of writing)
    $http.get('/api/dataset/' + vm.datasetKey + '/eventCount?parentEventID=' + vm.parentEventKey).then(function(response) {
        vm.childCount = response.data.endOfRecords ? response.data.count : undefined;
    })
        .catch(function() {
            // ignore
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
    vm.filter = {dataset_key: vm.datasetKey, parent_event_id: vm.parentEventKey};
  //  vm.pushChart('eventId', 'TABLE');
}

module.exports = datasetParentEventCtrl;
