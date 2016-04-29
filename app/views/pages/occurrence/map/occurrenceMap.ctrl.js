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
function occurrenceMapCtrl($stateParams, leafletData, mapConstants, $httpParamSerializer) {
    var vm = this;
    vm.query = angular.copy($stateParams);
    vm.query.key = vm.query.taxonKey;

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
            occurrences: getOverlay(vm.query)
        }
    };
    vm.mapDefaults = {
        zoomControlPosition: 'topleft',
        scrollWheelZoom: false
    };
}

module.exports = occurrenceMapCtrl;
