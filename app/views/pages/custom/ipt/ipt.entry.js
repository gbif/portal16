'use strict';

var _ = require('lodash');

angular
    .module('portal')
    .controller('iptCtrl', iptCtrl);

/** @ngInject */
function iptCtrl($http,  env) {
    var vm = this;

    vm.baselayer = {
        url: env.basemapTileApi + '/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-geyser-en&srs=EPSG%3A3857',
        attribution: '&copy; <a href=\'http://www.openstreetmap.org/copyright\' target=\'_blank\'>OpenStreetMap contributors</a>'
    };

    $http.get('/api/ipt/stats').success(function(data) {
        vm.countryCount = data.countryCount;
        vm.installationCount = data.installationCount;
        var publisherUrl = '/publisher/';
        _.each(data.geojson.features, function(feature) {
            var message = '<h4><a href="' + publisherUrl + feature.properties.key + '">' + feature.properties.title + '</a></h4>';
            message += '<div>Installations: ' + feature.properties.count + '</div>';
            feature.properties.message = message;
        });

        vm.geojson = data.geojson;

        /*
        L.geoJson(data.geojson, {
            onEachFeature: function(feature) {
                // get phrase in site language in plural or singular
                var publisherUrl = '/publisher/';
                // Create popup html
                var content = '<h4><a href="' + publisherUrl + feature.properties.key + '">' + feature.properties.title + '</a></h4>';
                content += '<div>Installations: ' + feature.properties.count + '</div>';

                vm.installations.addLayer(L.marker({
                    lat: feature.geometry.coordinates[1],
                    lng: feature.geometry.coordinates[0],
                    message: content
                }));
                angular.element(document).ready(function () {
                    var map = L.map('iptmap');
                    L.tileLayer(env.basemapTileApi + '/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-geyser-en&srs=EPSG%3A3857', {
                        showOnSelector: false,
                        attribution: '&copy; <a href=\'http://www.openstreetmap.org/copyright\' target=\'_blank\'>OpenStreetMap contributors</a>'
                    }).addTo(map);
                    map.once('focus', function() {
                        map.scrollWheelZoom.enable();
                    });
                    map.fitWorld().zoomIn();
                    map.addLayer(vm.installations);
                });
               vm.installations.push({
                    layer: 'installations',
                    lat: feature.geometry.coordinates[1],
                    lng: feature.geometry.coordinates[0],
                    message: content
                });
            }
        }); */
    });
}

module.exports = iptCtrl;
