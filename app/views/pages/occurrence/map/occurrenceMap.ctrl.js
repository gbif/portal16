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
function occurrenceMapCtrl($state, $scope, leafletData, mapConstants, $httpParamSerializer, $stateParams, env, OccurrenceSearch, OccurrenceFilter) {
    var vm = this;
    vm.occurrenceState = OccurrenceFilter.getOccurrenceData();
    vm.count = -1;
    vm.mapMenu = {
        occurrences: {}
    };

    var getOverlay = function(query) {
        var overlay = {
            name: 'gb',
            url: env.dataApi + "map/occurrence/tile.png?x={x}&y={y}&z={z}&srs=EPSG:4326&" + $httpParamSerializer(query),
            type: 'xyz',
            visible: true,
            layerParams: {
                opacity: 0.75,
                "showOnSelector": false
            }
        };
        return overlay;
    };

    vm.layers = {
        baselayers: {
            base: mapConstants.baseLayers.options['grey-4326']
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
        // OccurrenceSearch.query(vm.query, function (data) {
        //     vm.mapMenu.occurrences = data;
        // }, function () {
        // });
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
    var setOverlay = function(q) {
        //TODO this should be changed to match the new tile/heatmap api
        vm.query = q;
        if (Object.keys(vm.layers.overlays).length > 0) {
            vm.layers.overlays = {};
        }
        vm.layers.overlays['occurrences' + hashObject(vm.query)] =  getOverlay(vm.query);
    };

    setOverlay(angular.copy($stateParams));

    var latestData = {};
    var search = function(query) {
        query = angular.copy(query);
        query.hasCoordinate = 'true';
        query.limit = 0;
        vm.count = -1;
        if (latestData.$cancelRequest) latestData.$cancelRequest();
        latestData = OccurrenceSearch.query(query, function (data) {
            vm.count = data.count;
        }, function () {
            //TODO handle request error
        });
    };

    $scope.$watchCollection(function(){return $state.params }, function(newValue) {
        setOverlay(newValue);
        search(vm.occurrenceState.query);
    });
}

module.exports = occurrenceMapCtrl;
