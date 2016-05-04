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

    var getOverlay = function(query) {
        var overlay = {
            name: 'gb',
            url: "//cdn.gbif.org/v1/map/density/tile.png?x={x}&y={y}&z={z}&type=TAXON&resolution=4&" + $httpParamSerializer(query),
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
        overlays: {
            occurrences: getOverlay({key: 797})//getOverlay(vm.query)
        }
    };
    vm.mapDefaults = {
        zoomControlPosition: 'topleft',
        scrollWheelZoom: false
    };

    //vm.changeOverlay = function(){
    //    delete vm.layers.overlays.occurrences;
    //    vm.layers.overlays.layer = {
    //        name: 'gb',
    //        url: "//cdn.gbif.org/v1/map/density/tile.png?x={x}&y={y}&z={z}&type=TAXON&resolution=4&key=2888195",
    //        type: 'xyz',
    //        visible: true,
    //        layerParams: {
    //            "showOnSelector": true
    //        }
    //    };
    //};

    //var setOverlay = function() {
    //    console.log('set overlay');
    //    vm.query = angular.copy(OccurrenceFilter.query);
    //    vm.query.key = vm.query.taxonKey;
    //    if (angular.isArray(vm.query.taxonKey)) vm.query.key = vm.query.taxonKey[0];
    //
    //    vm.layers.overlays;
    //    var overlayName = 'occurrences';
    //    if (vm.layers.overlays.hasOwnProperty(overlayName)) {
    //        delete vm.layers.overlays[overlayName];
    //    }
    //    vm.layers.overlays[overlayName] = {
    //        name: 'gb',
    //        url: "//cdn.gbif.org/v1/map/density/tile.png?x={x}&y={y}&z={z}&type=TAXON&resolution=4&key=212",
    //        type: 'xyz',
    //        visible: true,
    //        layerParams: {
    //            "showOnSelector": false
    //        }
    //    };//getOverlay(vm.query);
    //};
    //
    //
    //$scope.$watchCollection(OccurrenceFilter.getQuery, function() {
    //    setOverlay();
    //});
}

module.exports = occurrenceMapCtrl;
