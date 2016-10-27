'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('theGbifNetworkCtrl', theGbifNetworkCtrl);

/** @ngInject */
function theGbifNetworkCtrl() {
    angular.element(document).ready(function(){
        var map = d3.geomap
            .choropleth()
            .geofile('https://d3-geomap.github.io//d3-geomap/topojson/world/countries.json')
            .colors(['#F6CD00','#9ABC7C'])
            .column('status')
            .domain([0.5,1])
            .legend(false)
            .unitId('country');

        d3.csv('https://dl.dropboxusercontent.com/u/608155/transient/participants.csv', function(error, data) {
            d3.select('#map')
                .datum(data)
                .call(map.draw, map);
        });
    });
}

module.exports = theGbifNetworkCtrl;