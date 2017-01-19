'use strict';

var angular = require('angular'),
    d3 = require('d3'),
    topojson = require('topojson');

angular
    .module('portal')
    .directive('theGbifNetworkMap', theGbifNetworkMap);

/** @ngInject */
function theGbifNetworkMap() {
    return {
        restrict: 'E',
        replace: 'false',
        scope: {
            region: '='
        },
        link: drawMap
    };

    function drawMap(scope, element, attrs) {
        var color = {
            'voting_participant': '#4E9F37',
            'associate_country_participant': '#58BAE9'
        };

        var margin = {top: 40, right: 20, bottom: 50, left: 40},
            width = 960 - margin.left - margin.right,
            height = 480 - margin.top - margin.bottom;

        var svg = d3.select(element[0]).append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        var path = d3.geoPath();

        d3.json("/api/topojson/world-robinson", function(error, topology) {
            if (error) throw error;

            svg.append("g")
                .selectAll("path")
                .data(topojson.feature(topology, topology.objects.tracts).features)
                .enter().append("path")
                .attr("d", path)
                .attr("fill", function(d){
                    if (d.properties.hasOwnProperty('membershipType')) {
                        return color[d.properties.membershipType];
                    }
                    return '#DFDDCF';
                });
        });
    }
}

module.exports = theGbifNetworkMap;
