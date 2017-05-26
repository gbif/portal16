'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    utils = require('../../../shared/layout/html/utils/utils');

require('./datasets/publisherDatasets.ctrl');
require('./installations/publisherInstallations.ctrl');

angular
    .module('portal')
    .controller('publisherKeyCtrl', publisherKeyCtrl);

/** @ngInject */
function publisherKeyCtrl($stateParams, $state, PublisherExtended, OccurrenceSearch, Node) {
    var vm = this;
    vm.key = $stateParams.key;
    vm.$state = $state;
    vm.publisher = PublisherExtended.get({key: vm.key});
    vm.occurrences = OccurrenceSearch.query({publishing_org: vm.key, limit: 0});
    vm.images = OccurrenceSearch.query({publishing_org: vm.key, media_type: 'StillImage'});
    vm.images.$promise.then(function (resp) {
        utils.attachImages(resp.results);
    });
    vm.withCoordinates = OccurrenceSearch.query({
        publishing_org: vm.key,
        has_coordinate: true,
        has_geospatial_issue: false,
        limit: 0
    });

    vm.publisher.$promise.then(function(){
        vm.endorser = Node.get({id: vm.publisher.endorsingNodeKey});
        updateMap();
        extractContacts();
    });

    function extractContacts() {
        vm.technicalContact = _.find(vm.publisher.contacts, {type: 'TECHNICAL_POINT_OF_CONTACT'});
        vm.adminContact = _.find(vm.publisher.contacts, {type: 'ADMINISTRATIVE_POINT_OF_CONTACT'});
        console.log('sdf');
        console.log(vm.technicalContact);
    }

    //Map
    function updateMap() {
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
            "name": "Outdoor",
            "url": "https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=" + accessToken,
            options: {
                attribution: "&copy; <a href='https://www.mapbox.com/'>Mapbox</a> <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>",
                detectRetina: false //TODO can this be fixed? Currently the mapbox retina tiles have such a small text size that I'd prefer blurry maps that I can read
            },
            type: 'xyz',
            layerOptions: {
                "showOnSelector": false,
                palette: 'yellows_reds'
            }
        };
        vm.mapDefaults = {
            zoomControlPosition: 'topleft',
            scrollWheelZoom: true,
            zoomControl: false
        };
        vm.mapEvents = {
            map: {
                enable: [], //https://github.com/tombatossals/angular-leaflet-directive/issues/1033
                logic: 'broadcast'
            },
            marker: {
                enable: [],
                logic: 'broadcast'
            }
        };

    };
}

module.exports = publisherKeyCtrl;