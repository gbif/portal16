'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    utils = require('../../../shared/layout/html/utils/utils');

require('./metrics/publisherMetrics.ctrl');
require('../../../components/literatureBreakdown/literatureBreakdown.directive');

angular
    .module('portal')
    .controller('publisherKeyCtrl', publisherKeyCtrl);

/** @ngInject */
function publisherKeyCtrl($stateParams, $state, MapCapabilities, OccurrenceTableSearch, LOCALE, PublisherExtended, OccurrenceSearch,
    ResourceSearch, Node, Page, PublisherInstallations, DatasetSearch, BUILD_VERSION) {
    var vm = this;
    Page.setTitle('Publisher');
    Page.drawer(false);
    vm.key = $stateParams.key;
    vm.capabilities = MapCapabilities.get({publishingOrg: vm.key});
    vm.$state = $state;
    vm.BUILD_VERSION = BUILD_VERSION;
    vm.publisher = PublisherExtended.get({key: vm.key});
    vm.installations = PublisherInstallations.get({id: vm.key, limit: 100});
    vm.datasets = DatasetSearch.get({publishing_org: vm.key, limit: 0});
    vm.hostedStats = DatasetSearch.get({hosting_org: vm.key, limit: 0, facet: ['publishing_org', 'publishing_country'], facetLimit: 5000});
    vm.literature = ResourceSearch.query({contentType: 'literature', publishingOrganizationKey: vm.key, limit: 0});
    vm.occurrences = OccurrenceSearch.query({publishing_org: vm.key, limit: 0});
    vm.images = OccurrenceSearch.query({publishing_org: vm.key, media_type: 'StillImage'});
    vm.images.$promise.then(function(resp) {
        utils.attachImages(resp.results);
    });

    vm.withCoordinates = OccurrenceSearch.query({
        publishing_org: vm.key,
        has_coordinate: true,
        has_geospatial_issue: false,
        limit: 0
    });

    vm.hostStats = {};
    vm.hostedStats.$promise.then(function(resp) {
        vm.hostStats.countryCount = Object.keys(resp.facets.PUBLISHING_COUNTRY.counts).length;
        vm.hostStats.publisherCount = Object.keys(resp.facets.PUBLISHING_ORG.counts).length;
        vm.hostStats.datasetCount = resp.count;
    });

    vm.publisher.$promise.then(function() {
        vm.endorser = Node.get({id: vm.publisher.endorsingNodeKey});
        updateMap();
        extractContacts();
        Page.setTitle(vm.publisher.title);
    });

    function extractContacts() {
        vm.technicalContact = _.find(vm.publisher.contacts, {type: 'TECHNICAL_POINT_OF_CONTACT'});
        vm.adminContact = _.find(vm.publisher.contacts, {type: 'ADMINISTRATIVE_POINT_OF_CONTACT'});
    }

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

    // Map
    function updateMap() {
        if (!vm.publisher.latitude || !vm.publisher.longitude) {
            return;
        }

        vm.marker = {point: [vm.publisher.longitude, vm.publisher.latitude], message: vm.publisher.title};
        vm.baselayer = {
            url: 'https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?',
            attribution: '&copy; <a href=\'https://www.mapbox.com/\' class="inherit">Mapbox</a> '
            + '<a href=\'http://www.openstreetmap.org/copyright\' target=\'_blank\' class="inherit">OpenStreetMap contributors</a>',
            params: {
                access_token: 'pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ'
            }
        };
    }
}

module.exports = publisherKeyCtrl;
