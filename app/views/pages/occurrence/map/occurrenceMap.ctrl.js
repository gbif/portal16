/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceMapCtrl', occurrenceMapCtrl);

/** @ngInject */
function occurrenceMapCtrl(leafletData, mapConstants, $httpParamSerializer, OccurrenceFilter, $stateParams, OccurrenceSearch) {
    var vm = this;
    vm.mapMenu = {
        occurrences: {}
    };
    OccurrenceFilter.setCurrentTab();
    var getOverlay = function(query) {
        var overlay = {
            name: 'gb',
            url: "http://api.gbif-uat.org/v1/map/occurrence/tile.png?x={x}&y={y}&z={z}&srs=EPSG:4326&" + $httpParamSerializer(query),
            type: 'xyz',
            visible: true,
            layerParams: {
                "showOnSelector": false
            }
        };
        return overlay;
    };

    vm.layers = {
        baselayers: {
            base: mapConstants.baseLayers.options['classic-4326']
        },
        overlays: {}
    };
    vm.mapDefaults = {
        zoomControlPosition: 'topleft',
        scrollWheelZoom: false
    };
    function onMapClick(event) {
        vm.query = angular.copy($stateParams);
        vm.query.decimalLatitude = (event.latlng.lat - (2/event.target._zoom) ) + ',' + (event.latlng.lat + (2/event.target._zoom));
        vm.query.decimalLongitude = (event.latlng.lng - (2/event.target._zoom)) + ',' + (event.latlng.lng + (2/event.target._zoom));
        OccurrenceSearch.query(vm.query, function (data) {
            vm.mapMenu.occurrences = data;
        }, function () {
        });
    }
    leafletData.getMap('occurrenceMap').then(function(map) {
        map.fitWorld().zoomIn();
        map.on('click', onMapClick);
    });

    var hashString = function(str) {
        var hash = 0, i, chr, len;
        if (str.length === 0) return hash;
        for (i = 0, len = str.length; i < len; i++) {
            chr   = str.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };
    var hashObject = function(obj) {
      return hashString(JSON.stringify(obj));
    };
    var setOverlay = function() {
        //TODO this should be changed to match the new tile/heatmap api
        vm.query = angular.copy($stateParams);
        if (Object.keys(vm.layers.overlays).length > 0) {
            vm.layers.overlays = {};
        }
        vm.layers.overlays['occurrences' + hashObject(vm.query)] =  getOverlay(vm.query);
    };

    setOverlay();
}

module.exports = occurrenceMapCtrl;
