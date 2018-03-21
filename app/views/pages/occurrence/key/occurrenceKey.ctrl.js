'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    globeCreator = require('../../../components/map/basic/globe');

angular
    .module('portal')
    .controller('occurrenceKeyCtrl', occurrenceKeyCtrl);

/** @ngInject */
function occurrenceKeyCtrl($stateParams, env, hotkeys, Page, occurrence, DatasetProcessSummary) {
    var vm = this,
        globe,
        globeCanvas = document.querySelector('.occurrenceKey__map .globe');
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
    vm.baselayer = {
        url: 'https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?',
        attribution: '&copy; <a href=\'https://www.mapbox.com/\' class="inherit">Mapbox</a> '
        + '<a href=\'http://www.openstreetmap.org/copyright\' target=\'_blank\' class="inherit">OpenStreetMap contributors</a>',
        params: {
            access_token: accessToken
        }
    };

    vm.markerMessage = {
        template: '<dl class="inline">{{coordinateUncertainty}}{{elevation}}</dl>',
        coordinateUncertaintyTemplate: '<div><dt>Coordinate uncertainty</dt><dd> {{coordinateUncertainty}}m</dd></div>',
        elevationTemplate: '<div><dt>Elevation</dt><dd> {{elevation}}</dd></div>',
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

    // create globe
    if (!globe && globeCanvas) {
        globe = globeCreator(globeCanvas, {
            land: '#4d5258',
            focus: 'deepskyblue'
        });
    }


    hotkeys.add({
        combo: 'alt+d',
        description: 'Show record details',
        callback: function() {
            vm.hideDetails = !vm.hideDetails;
            vm.expandMore = false;
        }
    });

    vm.data = occurrence;
    vm.center = {
        zoom: 6,
        point: [vm.data.decimalLongitude, vm.data.decimalLatitude]
    };

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
           vm.marker = {point: [data.decimalLongitude, data.decimalLatitude], message: vm.getMarkerMessage()};
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
        // set static marker
     /*   leafletData.getMap('occurrenceMap').then(function(map) {

            // attach globe to map
            if (globe) {
                globe.setCenter(map.getCenter().lat, map.getCenter().lng, map.getZoom());
                map.on('move', function() {
                    globe.setCenter(map.getCenter().lat, map.getCenter().lng, map.getZoom());
                });
            }
            // only enable scroll zoom once the map has been clicked
            map.once('focus', function() {
                map.scrollWheelZoom.enable();
            });
        });
        */
    }
}

module.exports = occurrenceKeyCtrl;
