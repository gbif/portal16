'use strict';

var angular = require('angular');
require('../../globeContext/globeContext.directive');

angular
    .module('portal')
    .directive('gbmap', gbmapDirective);

/** @ngInject */
function gbmapDirective() {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/map/basic/gbmap.html',
        scope: {
            type: '=',
            key: '=',
            mapstyle: '='
        },
        controller: gbmap,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function gbmap(leafletData, OccurrenceBbox, mapConstants, env, $scope, $timeout) {
        var vm = this;
        vm.id = 'gbifMap';//TODO how to handle mutiple ids? Random is ugly
        //vm.center = {zoom: 0, lat: 0, lng: 0};
        vm.mapstyle = vm.mapstyle || 'classic';
        vm.globeOptions = {
            center: {
                lat: 0,
                lng: 0
            },
            bounds: undefined
        };

        var palette = 'palette=yellows_reds';
        if (mapConstants.baseLayers.options[vm.mapstyle].layerOptions.palette) {
            palette = 'palette=' + mapConstants.baseLayers.options[vm.mapstyle].layerOptions.palette;
        }
        if (mapConstants.baseLayers.options[vm.mapstyle].layerOptions.colors) {
            palette = 'colors=' + mapConstants.baseLayers.options[vm.mapstyle].layerOptions.colors;
        }


        vm.controls = {
            scale: true
        };
        var getOverlay = function(palette, resolution) {
            var overlay = {
                name: 'gb',
                url: env.tileApi + '?x={x}&y={y}&z={z}&key={key}&type={type}&resolution=2&' + palette,
                type: 'xyz',
                visible: true,
                layerParams: {
                    key: vm.key || 0,
                    type: vm.type ? vm.type.toUpperCase() : 'TAXON',
                    "showOnSelector": false
                }
            };
            return overlay;
        };
        var setOverlay = function(q) {
            vm.query = q;
            if (Object.keys(vm.layers.overlays).length > 0) {
                vm.layers.overlays = {};
            }
            vm.layers.overlays['occurrences' + hashObject(vm.query)] =  getOverlay(vm.query);
        };

        vm.layers = {
            baselayers: {
                base: mapConstants.baseLayers.options[vm.mapstyle]
            },
            overlays: {
                occurrences: {
                    name: 'gb',
                    url: env.tileApi + '?x={x}&y={y}&z={z}&key={key}&type={type}&resolution=2&' + palette,
                    type: 'xyz',
                    visible: true,
                    layerParams: {
                        key: vm.key || 0,
                        type: vm.type ? vm.type.toUpperCase() : 'TAXON',
                        "showOnSelector": false
                    }
                }
            }
        };
        vm.mapDefaults = {
            zoomControlPosition: 'topleft',
            scrollWheelZoom: false
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

        leafletData.getMap(vm.id).then(function (map) {
            map.once('focus', function () {
                map.scrollWheelZoom.enable();
            });
            map.fitWorld().zoomIn();

            map.on('drag zoomend dragend', function() {
                updateGlobe(map);
            });
        });

        function updateGlobe(map) {
            $timeout( function() {
                $scope.$apply(function () {
                    vm.globeOptions.center = map.getCenter();
                    vm.globeOptions.bounds = map.getBounds();
                    vm.globeOptions.zoom = map.getZoom();
                });
            }, 50);
        }

        OccurrenceBbox.query({
            type: 'DATASET',
            key: vm.key
        }, function (data) {
            data.minimumLatitude = Math.max(-90, data.minimumLatitude - 2);
            data.minimumLongitude = Math.max(-180, data.minimumLongitude - 2);
            data.maximumLatitude = Math.min(90, data.maximumLatitude + 2);
            data.maximumLongitude = Math.min(180, data.maximumLongitude + 2);

            leafletData.getMap(vm.id).then(function (map) {
                //map.fitBounds([
                //    [data.minimumLatitude, data.minimumLongitude],
                //    [data.maximumLatitude, data.maximumLongitude]
                //]);
                //console.log(3);
                //if (map.getZoom() < 2){
                //    map.fitWorld().zoomIn();
                //}
                map.fitWorld().zoomIn().zoomIn();
                updateGlobe(map);
            });

            //leafletData.getMap(vm.id).then(function(map) {
            //    map.fitBounds([
            //        [ data.minimumLatitude, data.minimumLongitude ],
            //        [ data.maximumLatitude, data.maximumLongitude  ]
            //    ]);
            //});


        }, function () {
            //TODO
        });
    }
}

module.exports = gbmapDirective;
