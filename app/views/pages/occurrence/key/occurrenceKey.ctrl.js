'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    globeCreator = require('../../../components/map/basic/globe');

angular
    .module('portal')
    .controller('occurrenceKeyCtrl', occurrenceKeyCtrl);

/** @ngInject */
function occurrenceKeyCtrl($stateParams, env, hotkeys, Page, occurrence, SpeciesVernacularName, DatasetProcessSummary, $translate, TRANSLATION_UNCERTAINTY, TRANSLATION_ELEVATION) {
    var vm = this;
    vm.gb = gb;
    var globe;
    var globeCanvas;
    vm.key = $stateParams.key;
    Page.setTitle('Occurrence ' + vm.key);
    Page.drawer(false);

    vm.datasetProcessSummary = DatasetProcessSummary.get({key: occurrence.datasetKey});

    vm.mediaExpand = {
        isExpanded: false
    };

    vm.mediaItems = {};
    vm.dataApi = env.dataApi;

    vm.hideDetails = true;

    var accessToken = 'pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ';

    vm.highlights = {
        issues: {
            expanded: false
        }
    };

    vm.markerMessage = {
        template: '<dl class="inline">{{coordinateUncertainty}}{{elevation}}</dl>',
        coordinateUncertaintyTemplate: '<div><dt>' + TRANSLATION_UNCERTAINTY + '</dt><dd> {{coordinateUncertainty}}m</dd></div>',
        elevationTemplate: '<div><dt>' + TRANSLATION_ELEVATION + '</dt><dd> {{elevation}}</dd></div>',
        elevation: undefined
    };
    vm.getMarkerMessage = function() {
        var message, elevation = '', coordinateUncertainty = '';

        if (vm.data.coordinateUncertaintyInMeters) {
            coordinateUncertainty = vm.markerMessage.coordinateUncertaintyTemplate.replace('{{coordinateUncertainty}}', vm.data.coordinateUncertaintyInMeters);
        }

        if (vm.data.elevation) {
            var e = vm.data.elevation + 'm';
            elevation = vm.markerMessage.elevationTemplate.replace('{{elevation}}', e);
        }

        if ( elevation || coordinateUncertainty) {
            message = vm.markerMessage.template.replace('{{elevation}}', elevation).replace('{{coordinateUncertainty}}', coordinateUncertainty);
           // vm.markers.taxon.message = message;
        }
        return message;
    };


    hotkeys.add({
        combo: 'alt+d',
        description: 'Show record details',
        callback: function() {
            vm.hideDetails = !vm.hideDetails;
            vm.expandMore = false;
        }
    });

    vm.data = occurrence;
    vm.vernacularName = SpeciesVernacularName.get({id: vm.data.taxonKey});
    vm.center = {
        point: [vm.data.decimalLongitude, vm.data.decimalLatitude]
    };
    if (vm.data.decimalLatitude && Number(vm.data.decimalLatitude) < -85) {
        vm.projection = 'EPSG:3031';
        vm.center.zoom = 4;
    } else if (vm.data.decimalLatitude && Number(vm.data.decimalLatitude) > 85) {
        vm.projection = 'EPSG:3575';
        vm.center.zoom = 4;
    } else if (vm.data.decimalLatitude) {
        vm.projection = 'EPSG:3857';
        vm.center.zoom = 6;
        vm.baselayer = {
            url: 'https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?',
            attribution: '&copy; <a href="https://www.mapbox.com/" class="inherit">Mapbox</a>, '
            + '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" class="inherit">OpenStreetMap contributors</a>',
            params: {
                access_token: accessToken
            }
        };
    }

    if ((typeof vm.data.footprintWKT === 'undefined' || !hasValidOrNoSRS(vm.data)) && (typeof vm.data.decimalLatitude === 'undefined' || typeof vm.data.decimalLongitude === 'undefined')) {
        vm.hideMap = true;
    } else {
        vm.hideMap = false;
    }


    vm.setData = function() {
        // TODO find a better way to parse required data to controller from server without seperate calls
        // vm.occurrenceCoreTerms = gb.occurrenceCoreTerms;

        setMap(vm.data);
        if (typeof vm.data.elevation !== 'undefined') {
            vm.markerMessage.elevation = {
                elevation: vm.data.elevation,
                elevationAccuracy: vm.data.elevationAccuracy
            };
            vm.getMarkerMessage();
        }
    };

    function hasValidOrNoSRS(data) {
        if (typeof data.footprintSRS === 'undefined') {
            return true;
        }

        var footPrintSRS = _.get(data, 'footprintSRS', '').toLowerCase();
        if (footPrintSRS.indexOf('wgs84') > -1 || footPrintSRS.indexOf('wgs_1984') > -1 || footPrintSRS.indexOf('epsg:4326') > -1) {
            return true;
        } else {
            return false;
        }
    }
    function setMap(data) {
        if (typeof data.decimalLatitude !== 'undefined' && typeof data.decimalLongitude !== 'undefined') {
           vm.marker = {point: [data.decimalLongitude, data.decimalLatitude], message: vm.getMarkerMessage(), zoom: vm.center.z};
        }

        if (data.footprintWKT && hasValidOrNoSRS(data)) {
            vm.wkt = data.footprintWKT;
        } else if (data.coordinateUncertaintyInMeters > 50) {
            vm.circle = {
                coordinates: [data.decimalLongitude, data.decimalLatitude],
                radius: data.coordinateUncertaintyInMeters,
                message: vm.getMarkerMessage()
            };
        }

        // create globe
        angular.element(document).ready(function() {
            globeCanvas = document.querySelector('.occurrenceKey__map .globe')
            if (!globe && globeCanvas) {
                globe = globeCreator(globeCanvas, {
                    land: '#4d5258',
                    focus: 'deepskyblue'
                });
                globe.setCenter(vm.data.decimalLatitude, vm.data.decimalLongitude, vm.center.zoom);
                vm.onMapMove = function(lat, lng, zoom) {
                    globe.setCenter(lat, lng, zoom);
                };
            }
        });
    }
}

module.exports = occurrenceKeyCtrl;
