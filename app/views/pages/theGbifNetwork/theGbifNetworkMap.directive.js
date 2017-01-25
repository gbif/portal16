'use strict';

var angular = require('angular'),
    d3 = require('d3'),
    moment = require('moment'),
    topojson = require('topojson');

angular
    .module('portal')
    .directive('theGbifNetworkMap', theGbifNetworkMap);

/** @ngInject */
function theGbifNetworkMap(ParticipantHeads, CountryDataDigest, PublisherEndorsedBy) {
    return {
        restrict: 'A',
        replace: 'false',
        scope: {
            region: '=',
            membershipType: '='
        },
        templateUrl: '/templates/pages/theGbifNetwork/mapContainer/mapContainer.html',
        controller: svgMap,
        controllerAs: 'vm'
    };

    function svgMap($scope) {
        var vm = this;

        // default status of the mapContainer pane
        vm.expanded = false;

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

        $scope.infoPaneStatus = false;
        $scope.$watch('infoPaneStatus', function(){
            if ($scope.infoPaneStatus === true) {
                if ($scope.participantId && $scope.ISO2) {
                    ParticipantHeads.get({participantId: $scope.participantId}, function(result){
                        vm.heads = result;

                        // convert membershipStart to just year
                        vm.heads.participantInfo.membershipStart
                            = moment(vm.heads.participantInfo.membershipStart, 'MMMM YYYY').format('YYYY');
                    });
                    CountryDataDigest.get({iso2: $scope.ISO2}, function(result){
                        vm.digest = result[0];
                    });
                    PublisherEndorsedBy.get({iso2: $scope.ISO2}, function(result){
                        vm.endorsedPublisher = result.count;
                        vm.endorsedPublisherForm = result.count === 1 ? 'one' : 'other';
                    });
                }
            }
        });

        $scope.$watch('region', function(){
            zoomToRegion($scope.region);
        });

        $scope.$watch('membershipType', function(){
            if (centered) {
                zoomToPolygon(centered);
            }
            else {
                zoomToRegion($scope.region);
            }
        });

        // Draw map
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

        var background = svg.append('rect');
        background.attr('class', 'map-background')
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
                .attr('class', 'boundary')
                .on('click', clicked);

            zoomToRegion($scope.region);
        });

        function zoomToRegion(region) {
            centered = null;
            var bounds = regionBoxes[region],
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = 1 / Math.max(dx / width, dy / height),
                translate = [width / 2 - scale * x, height / 2 - scale * y];

            g.selectAll('path')
                .attr("fill", colorParticipant);

            g.transition()
                .duration(750)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

            shadow.transition()
                .duration(750)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

        }

        function zoomToPolygon(d) {
            centered = d;

            var bounds = path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = 0.9 / Math.max(dx / width, dy / height),
                translate = [width / 3 - scale * x, height / 1.6 - scale * y];

            g.selectAll('path')
                .attr("fill", colorParticipant);

            g.transition()
                .duration(750)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

            shadow.transition()
                .duration(750)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

            participantDigest(d);
        }

        function colorParticipant(d) {
            var p = d.properties;
            if (p.hasOwnProperty('membershipType') && p.hasOwnProperty('gbifRegion')) {
                if ($scope.region == 'GLOBAL') {
                    if ($scope.membershipType !== 'none') {
                        if ($scope.membershipType === 'active' || $scope.membershipType === p.membershipType) {
                            return color[d.properties.membershipType];
                        }
                    }
                }
                else if (p.gbifRegion == $scope.region) {
                    if ($scope.membershipType !== 'none') {
                        if ($scope.membershipType === 'active' || $scope.membershipType === p.membershipType) {
                            return color[d.properties.membershipType];
                        }
                    }
                }
            }
            return '#DFDDCF';
        }

        function clicked(d) {
            if (typeof d === 'undefined') {
                $scope.infoPaneStatus = false;
                zoomToRegion($scope.region);
            }
            else {
                if (d && centered !== d) {
                    $scope.infoPaneStatus = true;
                    zoomToPolygon(d);
                } else {
                    centered = null;
                    $scope.infoPaneStatus = false;
                    zoomToRegion($scope.region);
                }
            }
            $scope.$apply();
        }

        function participantDigest(d) {
            $scope.participantId = d.properties.id;
            $scope.ISO2 = d.properties.ISO2;
        }

    }
}

module.exports = theGbifNetworkMap;
