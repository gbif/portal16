'use strict';
var angular = require('angular');

//var test = {
//    "name": "Roads",
//    "url": "https://{s}.tiles.mapbox.com/v4/gbif.dec5e9ae/{z}/{x}/{y}.png?access_token=" + accessToken,
//        options: {
//        attribution: "&copy; <a href='https://www.mapbox.com/'>Mapbox</a> <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>"
//    },
//    type: 'xyz',
//        layerOptions: {
//        "showOnSelector": false
//    }
//};

var accessToken = 'pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ';
var baseLayers = {
    defaultOption: 'classic',
    options: {
        'classic': {
            name: "Classic",
            url: "https://{s}.tiles.mapbox.com/v4/gbif.faa58830/{z}/{x}/{y}.png?access_token=" + accessToken,
            options: {

            },
            type: 'xyz',
            layerOptions: {
                showOnSelector: false,
                palette: 'yellows_reds',
                attribution: "&copy; <a href='https://www.mapbox.com/'>Mapbox</a> <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>"
            }
        },
        'outdoor': {
            name: 'Outdoor',
            url: "https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=" + accessToken,
            options: {
                detectRetina: false //TODO can this be fixed? Currently the mapbox retina tiles have such a small text size that I'd prefer blurry maps that I can read
            },
            type: 'xyz',
            layerOptions: {
                showOnSelector: false,
                colors: '%2C%2C%23555555FF',
                attribution: "&copy; <a href='https://www.mapbox.com/'>Mapbox</a> <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>",
            }
        },
        'dark': {
            name: 'Night',
            url: "https://{s}.tiles.mapbox.com/v4/gbif.dec5e9ae/{z}/{x}/{y}.png?access_token=" + accessToken,
            options: {
            },
            type: 'xyz',
            layerOptions: {
                showOnSelector: false,
                saturation: true,
                attribution: "&copy; <a href='https://www.mapbox.com/'>Mapbox</a> <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>",
            }
        },
        'ocean': {
            "name": "Terrain",
            "url": "http://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}.png",
            options: {
            },
            type: 'xyz',
            layerOptions: {
                showOnSelector: false,
                palette: "yellows_reds",
                attribution: "&copy; Esri, DeLorme, FAO, NOAA, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community"
            }
        },
        'satellite': {
            name: "Satellite",
            url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png",
            options: {
            },
            type: 'xyz',
            layerOptions: {
                showOnSelector: false,
                palette: "yellows_reds",
                attribution: "&copy; Esri, DeLorme, FAO, NOAA, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community"
            }
        },
        'light': {
            name: "High contrast",
            url: "https://{s}.tiles.mapbox.com/v4/gbif.e8bcd045/{z}/{x}/{y}.png?access_token=" + accessToken,
            options: {
            },
            type: 'xyz',
            layerOptions: {
                showOnSelector: false,
                colors: "%2C%2C%23CC0000FF",
                attribution: "&copy; <a href='https://www.mapbox.com/'>Mapbox</a> <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>"
            }
        },
        'grey-blue': {
            name: 'Roads',
            url: "http://2.maps.nlp.nokia.com/maptile/2.1/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?app_id=_peU-uCkp-j8ovkzFGNU&app_code=gBoUkAMoxoqIWfxWA5DuMQ",
            options: {
            },
            type: 'xyz',
            layerOptions: {
                colors: '%2C%2C%23CC0000FF',
                showOnSelector: false,
                attribution: '&copy; <a href="https://legal.here.com/en/terms/serviceterms/us/">Nokia</a>'
            }
        }
    }
};


(function () {


    angular
        .module('portal')
        .constant('mapConstants', {
            baseLayers: baseLayers
        });
})();