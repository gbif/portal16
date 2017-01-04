'use strict';
var d3 = require('d3'),
    world = require('./world-110m'),
    topojson = require('topojson');

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


module.exports = function (element, options) {
    var globeOptions = {};

    var width = 70,
        height = width,
        radius = height / 2 - 5,
        scale = radius;

    var projection = d3.geoOrthographic()
        .translate([width / 2, height / 2])
        .scale(scale)
        .clipAngle(90);

    var canvas = d3.select(element)
        .attr("width", width)
        .attr("height", height);

    var context = canvas.node().getContext("2d");

    var path = d3.geoPath()
        .projection(projection)
        .context(context);

    var graticule = d3.geoGraticule();
    var land = topojson.feature(world, world.objects.land);


    //async version to load world data
    //var land = {};
    //d3.json("https://dl.dropboxusercontent.com/u/2718924/world-110m.json", function(error, world) {
    //  if (error) throw error;
    //  land = topojson.feature(world, world.objects.land);
    //  setCenter(vm.globeOptions.center.lat, vm.globeOptions.center.lng, vm.globeOptions.bounds);
    //});

    function updateStyle(opt) {
        opt = opt || {};
        globeOptions.landColor = opt.land || "#ccc";
        globeOptions.waterColor = opt.water || "#eee";
        globeOptions.graticules = opt.graticules || "#bbb";
        globeOptions.focus = opt.focus || "rgba(0,0,0,0.3)";
        globeOptions.border = opt.border || "#aaa";
    }

    updateStyle(options);
    setCenter(0, 0, 0);

    function setCenter(lat, lng, zoom) {
        lat = lat || 0;
        lng = lng || 0;
        zoom = zoom || 0;
        var rotationLat = Math.min(lat, 60);
        rotationLat = Math.max(rotationLat, -60);
        context.clearRect(0, 0, width, height);

        projection.rotate([-lng, -rotationLat]);

        //background
        context.beginPath();
        context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, true);
        context.fillStyle = globeOptions.waterColor;
        context.fill();

        //land mass
        context.beginPath();
        path(land);
        context.fillStyle = globeOptions.landColor;
        context.fill();

        //graticules
        context.beginPath();
        path(graticule());
        context.lineWidth = .25;
        context.strokeStyle = globeOptions.graticules;
        context.stroke();

        //point
        //only show the point if we are zoomed in and within the map
        if (zoom > 3 && Math.abs(lat) < 90) {
            context.beginPath();
            path(getPointGeoJson({lat: lat, lng: lng}));
            context.fillStyle = globeOptions.focus;
            context.fill();
        }

        //border
        context.beginPath();
        context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, true);
        context.lineWidth = .5;
        context.strokeStyle = globeOptions.border;
        context.stroke();
    }

    return {
        setCenter: setCenter,
        updateStyle: updateStyle
    }
}