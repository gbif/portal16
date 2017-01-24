'use strict';

var angular = require('angular'),
    d3 = require('d3'),
    topojson = require('topojson');

angular
    .module('portal')
    .directive('theGbifNetworkMap', theGbifNetworkMap);

/** @ngInject */
function theGbifNetworkMap($translate) {
    return {
        restrict: 'A',
        replace: 'false',
        scope: {
            region: '=',
            membershipType: '='
        },
        link: drawMap,
        templateUrl: '/templates/pages/theGbifNetwork/legend/legend.html',
        controller: svgMap,
        controllerAs: 'vm'
    };

    function svgMap($scope) {
        var vm = this;

        // default status of the legend pane
        vm.expanded = true;

        // membership type toggle
        vm.vpChecked = false;
        vm.acpChecked = false;

        vm.toggleParticipant = function () {
            if (!vm.vpChecked && !vm.acpChecked) {
                $scope.membershipType = 'none';
            }
            else if (vm.vpChecked && !vm.acpChecked) {
                $scope.membershipType = 'voting_participant';
            }
            else if (!vm.vpChecked && vm.acpChecked) {
                $scope.membershipType = 'associate_country_participant';
            }
            else {
                $scope.membershipType = 'active';
            }
        };

    }

    function drawMap(scope, element, attrs) {
        var color = {
            'voting_participant': '#4E9F37',
            'associate_country_participant': '#58BAE9'
        };

        var margin = {top: 40, right: 20, bottom: 50, left: 40},
            width = 960 - margin.left - margin.right,
            height = 480 - margin.top - margin.bottom,
            svgWidth = width + margin.left + margin.right,
            svgHeight = height + margin.top + margin.bottom,
            centered;

        var svg = d3.select('#map').append("svg")
            .attr('id', 'theGbifNetworkMap')
            //.attr('width', svgWidth)
            //.attr('height', svgHeight)
            .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .classed('svg-content', true);

        var path = d3.geoPath();

        var filter = svg.append('defs')
            .append('filter')
            .attr('id', 'dropShadow')
            .attr('height', '130%');
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 3);
        filter.append("feOffset")
            .attr("dx", 2)
            .attr("dy", 2)
            .attr("result","offsetblur");
        filter.append('feComponentTransfer')
            .append('feFuncA')
            .attr('type', 'linear')
            .attr('slope', 0.2);

        var feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode");
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");

        svg.append('rect')
            .attr('class', 'map-background')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .on('click', clicked);

        var shadow = svg.append('path');

        var g = svg.append('g');

        var regionBoxes = {
            'GLOBAL': [[0,0],[width,height]],
            'ASIA': [[540,105],[870,305]],
            'AFRICA': [[420,140],[640,350]],
            'EUROPE': [[380,80],[750,100]],
            'LATIN_AMERICA': [[155,160],[395,400]],
            'NORTH_AMERICA': [[100,50],[350,170]],
            'OCEANIA': [[760,250],[1000,400]]
        };

        d3.json("/api/topojson/world-robinson", function(error, topology) {
            if (error) throw error;

            shadow.datum(topojson.merge(topology, topology.objects.tracts.geometries))
                .attr('d', path)
                .attr('class', 'map-shadow')
                .style('filter', 'url(#dropShadow)');

            g.selectAll("path")
                .data(topojson.feature(topology, topology.objects.tracts).features)
                .enter().append("path")
                .attr("d", path)
                .on('click', clicked)
                .attr('class', 'boundary');

            zoomToRegion(scope.region);

            scope.mapLoaded = true;
        });

        scope.$watch('region', function(){
            zoomToRegion(scope.region);
        });

        scope.$watch('membershipType', function(){
            zoomToRegion(scope.region);
        });

        function zoomToRegion(region) {
            var bounds = regionBoxes[region],
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = 1 / Math.max(dx / width, dy / height),
                translate = [width / 2 - scale * x, height / 2 - scale * y];

            g.selectAll('path')
                .attr("fill", function(d){
                    var p = d.properties;
                    if (p.hasOwnProperty('membershipType') && p.hasOwnProperty('gbifRegion')) {
                        if (scope.region == 'GLOBAL') {
                            if (scope.membershipType !== 'none') {
                                if (scope.membershipType === 'active' || scope.membershipType === p.membershipType) {
                                    return color[d.properties.membershipType];
                                }
                            }
                        }
                        else if (p.gbifRegion == scope.region) {
                            if (scope.membershipType !== 'none') {
                                if (scope.membershipType === 'active' || scope.membershipType === p.membershipType) {
                                    return color[d.properties.membershipType];
                                }
                            }
                        }
                    }
                    return '#DFDDCF';
                });

            g.transition()
                .duration(750)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

            shadow.transition()
                .duration(750)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

        }

        function clicked(d) {
            if (typeof d === 'undefined') {
                zoomToRegion(scope.region);
            }
            else {
                var x, y, k;
                if (d && centered !== d) {
                    var centroid = path.centroid(d);
                    x = centroid[0];
                    y = centroid[1];
                    k = 4;
                    centered = d;
                    g.selectAll("path")
                        .classed("active-polygon", centered && function(d) { return d === centered; });

                    g.transition()
                        .duration(750)
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                        .style("stroke-width", 1.5 / k + "px");

                    shadow.transition()
                        .duration(750)
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                        .style("stroke-width", 1.5 / k + "px");

                } else {
                    centered = null;
                    zoomToRegion(scope.region);
                }

            }
        }
    }
}

module.exports = theGbifNetworkMap;
