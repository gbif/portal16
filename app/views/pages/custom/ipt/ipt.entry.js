'use strict';

angular
    .module('portal')
    .controller('iptCtrl', iptCtrl);

/** @ngInject */
function iptCtrl($http, leafletData, env) {
    var vm = this;
    vm.mapDefaults = {
        zoomControlPosition: 'topleft',
        scrollWheelZoom: false,
        crs: L.CRS.EPSG3857
    };
    vm.center = {zoom: 7, lat: 0, lng: 0};
console.log(env);
    var baseMap = {
        name: "Classic",
        url: env.basemapTileApi + "/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-light&srs=EPSG%3A3857",
        options: {},
        type: 'xyz',
        layerOptions: {
            showOnSelector: false,
            attribution: "&copy; <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>"
        }
    };
    vm.layers = {
        baselayers: {
            base: baseMap
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

    $http.get('/api/ipt/stats').success(function (data) {
        console.log(data);
        vm.countryCount = data.countryCount;
        vm.installationCount = data.installationCount;
        L.geoJson(data.geojson, {
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