'use strict';

var angular = require('angular'),
    d3 = require('d3'),
    world = require('./world-110m'),
    topojson = require('topojson');

angular
    .module('portal')
    .directive('globeContext', globeContextDirective);

/** @ngInject */
function globeContextDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/globeContext/globeContext.html',
        scope: {
            globeOptions: '='
        },
        controller: globeContext,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function globeContext($scope) {
        var vm = this;

        function getPointGeoJson(center) {
            return {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                center.lng,
                                center.lat
                            ]
                        }
                    }
                ]
            }
        }

        //function getBboxGeoJson(bounds) {
        //    return {
        //        "type": "FeatureCollection",
        //        "features": [
        //            {
        //                "type": "Feature",
        //                "properties": {},
        //                "geometry": {
        //                    "type": "Polygon",
        //                    "coordinates": [
        //                        [
        //                            [
        //                                bounds._southWest.lng,
        //                                bounds._southWest.lat
        //                            ],
        //                            [
        //                                bounds._northEast.lng,
        //                                bounds._southWest.lat
        //                            ],
        //                            [
        //                                bounds._northEast.lng,
        //                                bounds._northEast.lat
        //                            ],
        //                            [
        //                                bounds._southWest.lng,
        //                                bounds._northEast.lat
        //                            ],
        //                            [
        //                                bounds._southWest.lng,
        //                                bounds._southWest.lat
        //                            ]
        //                        ]
        //                    ]
        //                }
        //            }
        //        ]
        //    };
        //}

        var width = 70,
            height = width,
            radius = height / 2 - 5,
            scale = radius;

        var projection = d3.geoOrthographic()
            .translate([width / 2, height / 2])
            .scale(scale)
            .clipAngle(90);

        var canvas = d3.select(".globe")
            .attr("width", width)
            .attr("height", height);

        var context = canvas.node().getContext("2d");

        var path = d3.geoPath()
            .projection(projection)
            .context(context);

        var graticule = d3.geoGraticule();
        var land = topojson.feature(world, world.objects.land);
        setCenter(vm.globeOptions.center.lat, vm.globeOptions.center.lng, vm.globeOptions.bounds);

        //async version to load world data
        //var land = {};
        //d3.json("https://dl.dropboxusercontent.com/u/2718924/world-110m.json", function(error, world) {
        //  if (error) throw error;
        //  land = topojson.feature(world, world.objects.land);
        //  setCenter(vm.globeOptions.center.lat, vm.globeOptions.center.lng, vm.globeOptions.bounds);
        //});

        function setCenter(lat, lng) {
            //lat = Math.min(lat, 50);
            //lat = Math.max(lat, -50);
            context.clearRect(0, 0, width, height);

            projection.rotate([-lng, -lat]);

            //background
            context.beginPath();
            context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, true);
            context.fillStyle = "#eee";
            context.fill();

            //land mass
            context.beginPath();
            path(land);
            context.fillStyle = "#ccc";
            context.fill();

            //graticules
            context.beginPath();
            path(graticule());
            context.lineWidth = .25;
            context.strokeStyle = "#bbb";
            context.stroke();

            //point
            if (vm.globeOptions.zoom > 3) {
                context.beginPath();
                path(getPointGeoJson({lat: lat, lng: lng}));
                context.fillStyle = "rgba(0,0,0,0.3)";
                context.fill();
            }

            //border
            context.beginPath();
            context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, true);
            context.lineWidth = .5;
            context.strokeStyle = "#aaa";
            context.stroke();
        }

        $scope.$watchCollection(function () {
            return vm.globeOptions;
        }, function (newOptions) {
            setCenter(newOptions.center.lat, newOptions.center.lng, newOptions.bounds);
        }, true);


    }
}

module.exports = globeContextDirective;
