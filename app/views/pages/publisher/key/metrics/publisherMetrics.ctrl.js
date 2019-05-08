'use strict';

var angular = require('angular');

angular
  .module('portal')
  .controller('publisherMetricsCtrl', publisherMetricsCtrl);

/** @ngInject */
function publisherMetricsCtrl($state, $stateParams, OccurrenceTableSearch, OccurrenceSearch, LOCALE, MapCapabilities) {
  var vm = this;
  vm.$state = $state;
  vm.key = $stateParams.key;
  vm.defaultCharts = [];
  vm.capabilities = MapCapabilities.get({networkKey: vm.key});
  vm.withCoordinates = OccurrenceSearch.query({
    publishingOrg_key: vm.key,
    has_coordinate: true,
    has_geospatial_issue: false,
    limit: 0
  });

  vm.kingdoms = [
    {id: 1, title: 'Animalia', icon: 'animalia'},
    {id: 6, title: 'Plantae', icon: 'plantae'},
    {id: 5, title: 'Fungi', icon: 'fungi'},
    {id: 2, title: 'Archaea', icon: 'archaea'},
    {id: 3, title: 'Bacteria', icon: 'bacteria'},
    {id: 4, title: 'Chromista', icon: 'chromista'},
    {id: 7, title: 'Protozoa', icon: 'protozoa'},
    {id: 8, title: 'Viruses', icon: 'viruses'},
    {id: 0, title: 'incertae sedis', icon: 'unknown'}
  ];

  OccurrenceTableSearch.query({
    publishingOrg: vm.key,
    facet: 'kingdomKey',
    limit: 0
  }, function(response) {
    vm.kingdomCounts = response.facets.KINGDOM_KEY.counts;
  }, function() {
    // TODO couldn't get the data
  });

  // intiate charts
  vm.charts = [];
  vm.pushChart = function(dimension, type, customFilter) {
    var chartConfig = {
      api: {},
      config: {dimension: dimension, secondDimension: '', type: type, showSettings: false},
      filter: {publishing_org: vm.key, locale: LOCALE},
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
  vm.pushChart('institutionCode', 'PIE');
  vm.pushChart('collectionCode', 'TABLE');
}


module.exports = publisherMetricsCtrl;
