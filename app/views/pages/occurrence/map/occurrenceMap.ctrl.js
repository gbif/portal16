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
            //occurrences: getOverlay(vm.query)
        }
    };
    vm.mapDefaults = {
        zoomControlPosition: 'topleft',
        scrollWheelZoom: false
    };

    var setOverlay = function() {
        console.log('set overlay');
        vm.query = angular.copy(OccurrenceFilter.query);
        vm.query.key = vm.query.taxonKey;
        if (vm.query.taxonKey.length > 0) vm.query.key = vm.query.taxonKey[0];
        //vm.query.key = 212;
        vm.layers.overlays.occurrences = getOverlay(vm.query);
    };


    $scope.$watchCollection(OccurrenceFilter.getQuery, function() {
        setOverlay();
    });
}

module.exports = occurrenceMapCtrl;
