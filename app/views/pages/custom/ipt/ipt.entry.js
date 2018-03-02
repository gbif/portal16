'use strict';

var _ = require('lodash');

angular
    .module('portal')
    .controller('iptCtrl', iptCtrl);

/** @ngInject */
function iptCtrl($http, env) {
    var vm = this;

    vm.baselayer = {
        url: env.basemapTileApi + '/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-geyser-en&srs=EPSG%3A3857',
        attribution: '&copy; <a class="inherit" href=\'http://www.openstreetmap.org/copyright\' target=\'_blank\'>OpenStreetMap contributors</a>'
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

    });
}

module.exports = iptCtrl;
