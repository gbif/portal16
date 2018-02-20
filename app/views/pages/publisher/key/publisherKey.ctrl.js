'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    utils = require('../../../shared/layout/html/utils/utils');


angular
    .module('portal')
    .controller('publisherKeyCtrl', publisherKeyCtrl);

/** @ngInject */
function publisherKeyCtrl($stateParams, $state, MapCapabilities, PublisherExtended, OccurrenceSearch, ResourceSearch, Node, Page, PublisherInstallations, DatasetSearch, BUILD_VERSION) {
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

    // Map
    function updateMap() {
        if (!vm.publisher.latitude || !vm.publisher.longitude) {
            return;
        }
        vm.showMapToggle = false;
        vm.center = {zoom: 7, lat: vm.publisher.latitude, lng: vm.publisher.longitude};
        vm.markers = {};
        vm.markers.office = {
            lat: vm.publisher.latitude,
            lng: vm.publisher.longitude,
            focus: false
        };
        var accessToken = 'pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ';

        vm.highlights = {
            issues: {
                expanded: false
            }
        };
        vm.tiles = {
            'name': 'Outdoor',
            'url': 'https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + accessToken,
            'options': {
                attribution: '&copy; <a href=\'https://www.mapbox.com/\'>Mapbox</a> <a href=\'http://www.openstreetmap.org/copyright\' target=\'_blank\'>OpenStreetMap contributors</a>',
                detectRetina: false // TODO can this be fixed? Currently the mapbox retina tiles have such a small text size that I'd prefer blurry maps that I can read
            },
            'type': 'xyz',
            'layerOptions': {
                'showOnSelector': false,
                'palette': 'yellows_reds'
            }
        };
        vm.mapDefaults = {
            zoomControlPosition: 'topleft',
            scrollWheelZoom: true,
            zoomControl: false
        };
        vm.mapEvents = {
            map: {
                enable: [], // https://github.com/tombatossals/angular-leaflet-directive/issues/1033
                logic: 'broadcast'
            },
            marker: {
                enable: [],
                logic: 'broadcast'
            }
        };
    }
}

module.exports = publisherKeyCtrl;
