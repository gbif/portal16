'use strict';

angular
    .module('portal')
    .controller('iptCtrl', iptCtrl);

/** @ngInject */
function iptCtrl($http, leafletData, mapConstants) {
    var vm = this;
    vm.mapDefaults = {
        zoomControlPosition: 'topleft',
        scrollWheelZoom: false,
        crs: L.CRS.EPSG4326
    };
    vm.center = {zoom: 7, lat: 0, lng: 0};

    vm.layers = {
        baselayers: {
            base: mapConstants.baseLayers.options['grey-4326']
        },
        overlays: {
            installations: {
                name: "installations",
                type: "markercluster", //group
                visible: true,
                layerParams: {
                    "showOnSelector": false,
                    showCoverageOnHover: false,
                    maxClusterRadius: 40
                }
            }
        }
    };
    vm.installations = [];

    $http.get('//api.gbif.org/v1/installation/location/IPT_INSTALLATION').success(function (data) {
        L.geoJson(data, {
            onEachFeature: function (feature) {
                //get phrase in site language in plural or singular
                var publisherUrl = '/publisher/';
                //Create popup html
                var content = '<h4><a href="' + publisherUrl + feature.properties.key + '">' + feature.properties.title + '</a><\/h4>';
                content += '<div>Installations: ' + feature.properties.count + '</div>';

                vm.installations.push({
                    layer: 'installations',
                    lat: feature.geometry.coordinates[1],
                    lng: feature.geometry.coordinates[0],
                    message: content
                });
            }
        });
    });

    leafletData.getMap('iptInstallationsMap').then(function (map) {
        map.once('focus', function () {
            map.scrollWheelZoom.enable();
        });
        map.fitWorld().zoomIn();
    });

}

module.exports = iptCtrl;