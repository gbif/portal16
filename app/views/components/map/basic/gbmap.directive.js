'use strict';

var angular = require('angular');
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
    function gbmap(leafletData, OccurrenceBbox, mapConstants) {
        var vm = this;
        vm.id = 'gbifMap';//TODO how to handle mutiple ids? Random is ugly
        //vm.center = {zoom: 0, lat: 0, lng: 0};
        vm.mapstyle = vm.mapstyle || 'classic';

        vm.layers = {
            baselayers: {
                base: mapConstants.baseLayers.options[vm.mapstyle]
            },
            overlays: {
                occurrences: {
                    name: 'gb',
                    url: "//cdn.gbif.org/v1/map/density/tile.png?x={x}&y={y}&z={z}&key={key}&type={type}&resolution=4",
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

        leafletData.getMap(vm.id).then(function(map) {
            map.once('focus', function() { map.scrollWheelZoom.enable(); });
            //map.fitWorld().zoomIn();
            map.fitBounds([
                [40.712, -74.227],
                [40.774, -74.125]
            ]);
        });

        OccurrenceBbox.query({
            type: 'DATASET',
            key: vm.key
        }, function(data) {
            data.minimumLatitude = Math.max(-90, data.minimumLatitude - 2);
            data.minimumLongitude = Math.max(-180, data.minimumLongitude - 2);
            data.maximumLatitude = Math.min(90, data.maximumLatitude + 2);
            data.maximumLongitude = Math.min(180, data.maximumLongitude + 2);

            leafletData.getMap(vm.id).then(function(map) {
                map.fitBounds([
                    [ data.minimumLatitude, data.minimumLongitude ],
                    [ data.maximumLatitude, data.maximumLongitude  ]
                ]);
                //map.fitBounds([[-75.62778879339942,-180],[85.19489563661588,180]]);
            });

            //leafletData.getMap(vm.id).then(function(map) {
            //    map.fitBounds([
            //        [ data.minimumLatitude, data.minimumLongitude ],
            //        [ data.maximumLatitude, data.maximumLongitude  ]
            //    ]);
            //});


        }, function() {
            //TODO
        });
    }
}

module.exports = gbmapDirective;
