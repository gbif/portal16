'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('theGbifNetworkCtrl', theGbifNetworkCtrl);

/** @ngInject */
function theGbifNetworkCtrl($http, $location) {
    angular.element(document).ready(function(){
        /*
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
        */
    });
    var vm = this;
    vm.currentRegion = $location.path().split('/')[2].toUpperCase().replace('-', '_');
    vm.count = {
        'voting_participant': 0,
        'associate_country_participant': 0,
        'other_associate_participant': 0,
        'publisher': 0,
        'literature': 0,
        'literatureAuthors': 0,
        'literatureAuthorFromCountries': 0
    };

    vm.selectRegion = function(region) {
        vm.currentRegion = region;
        region = region.toLowerCase().replace('_', '-');
        $location.path('/the-gbif-network/' + region);
    };
}

module.exports = theGbifNetworkCtrl;