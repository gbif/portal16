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
function occurrenceMapCtrl($scope, leafletData, mapConstants, $httpParamSerializer, OccurrenceFilter) {
    var vm = this;
    OccurrenceFilter.setCurrentTab();
    var getOverlay = function(query) {
        var overlay = {
            name: 'gb',
            url: "//cdn.gbif.org/v1/map/density/tile.png?x={x}&y={y}&z={z}&type=TAXON&resolution=1&" + $httpParamSerializer(query),
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
            base: mapConstants.baseLayers.options.classic
        },
        overlays: {}
    };
    vm.mapDefaults = {
        zoomControlPosition: 'topleft',
        scrollWheelZoom: false
    };
    leafletData.getMap('occurrenceMap').then(function(map) {
        map.fitWorld().zoomIn();
    });

    var setOverlay = function() {
        //TODO this should be changed to match the new tile/heatmap api
        vm.query = angular.copy(OccurrenceFilter.query);
        vm.query.key = vm.query.taxonKey;
        if (angular.isArray(vm.query.taxonKey)) vm.query.key = vm.query.taxonKey[0];
        if (Object.keys(vm.layers.overlays).length > 0) {
            vm.layers.overlays = {};
        }
        vm.layers.overlays['occurrences' + vm.query.key] =  getOverlay(vm.query);
    };

    $scope.$watchCollection(OccurrenceFilter.getQuery, function() {
        setOverlay();
    });
    setOverlay();
}

module.exports = occurrenceMapCtrl;
