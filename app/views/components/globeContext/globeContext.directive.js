'use strict';

var angular = require('angular'),
    d3 = require('d3'),
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

        var width = 100,
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
        var land = {};

        d3.json("https://dl.dropboxusercontent.com/u/2718924/world-110m.json", function(error, world) {
          if (error) throw error;
          land = topojson.feature(world, world.objects.land);
          setCenter(0,0);
        });

        function setCenter(lat, lon) {
            context.clearRect(0, 0, width, height);

            projection.rotate([lat, lon]);

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
            context.lineWidth = .5;
            context.strokeStyle = "#aaa";
            context.stroke();

            //bbox
            // context.beginPath();
            // path(square);
            // context.strokeStyle = "#888";
            // context.lineWidth = 5;
            // context.fillStyle = "rgba(0,0,0,0.1)";
            // context.fill();
            // context.stroke();

            // //point
            // context.beginPath();
            // path(point);
            // context.fillStyle = "deepskyblue";
            // context.fill();

            //border
            context.beginPath();
            context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, true);
            context.lineWidth = 0.5;
            context.stroke();
        }

        $scope.$watch(function(){
            console.log(vm.globeOptions.center.lat); 
            return vm.globeOptions.center.lat
        }, function(newSetting){
            console.log('sdf');
        });

    }
}

module.exports = globeContextDirective;
