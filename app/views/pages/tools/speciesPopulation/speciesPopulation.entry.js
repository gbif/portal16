'use strict';

//var mapboxgl = require('mapbox-gl');


angular
    .module('portal')
    .controller('speciesPopulationCtrl', speciesPopulationCtrl);

/** @ngInject */
function speciesPopulationCtrl() {
    var vm = this;
    vm.test = 'hej';
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ';


    //var Draw = new MapboxDraw({
    //    displayControlsDefault: false,
    //    controls: {
    //        polygon: true,
    //        trash: true
    //    }
    //});

    //map.addControl(Draw);

    var colors = [
        '#a50f15',
        '#de2d26',
        '#fb6a4a',
        '#fcae91',
        '#fee5d9',
        '#edf8e9',
        '#bae4b3',
        '#74c476',
        '#31a354',
        '#006d2c'
    ];

    var paintFill = {
        "fill-color": "#0F0",
        "fill-opacity": 0.4
    };

    var mapStyle = {
        "version": 8,
        "name": "Light",
        "sources": {
            "mapbox": {
                "type": "vector",
                "url": "mapbox://mapbox.mapbox-streets-v6"
            },
            "gbif": {
                "type": "vector",
                //"tiles": ["http://localhost:7001/map/occurrence/regression/{z}/{x}/{y}.mvt?taxonKey=1898286&higherTaxonKey=797"]
                "tiles": ["http://api.gbif-uat.org/v2/map/occurrence/regression/{z}/{x}/{y}.mvt?taxonKey=1898286&higherTaxonKey=797"]
                //"tiles": ["http://localhost:7001/map/occurrence/regression/{z}/{x}/{y}.mvt?taxonKey=212&higherTaxonKey=1&srs=EPSG:4326&year=1990,2000"]

                // taxonKey=4989904&higherTaxonKey=7782
            }
        },
        "sprite": "mapbox://sprites/mapbox/light-v9",
        "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
        "layers": [
            {
                "id": "background",
                "type": "background",
                "paint": {"background-color": "#ededed"}
            },
            {
                "id": "water",
                "source": "mapbox",
                "source-layer": "water",
                "type": "fill",
                "paint": {"fill-color": "#d6d6d6"}
            },
            {
                "id": "gbifOccurrence",
                "source": "gbif",
                "source-layer": "occurrence",
                "type": "fill",
                "paint": {"fill-color": "#2c2c2c"}
            }
        ]
    };

    var map = new mapboxgl.Map({
        container: 'speciesPopulationMap',
        style: mapStyle,
        center: [10, 50],
        zoom: 3,
        hash: false
    });

    map.on('style.load', function () {
        var breakpoints = colors.reverse().map(function (e, i) {
            return [(colors.length - 6 - i) * 0.0002, e];
        });

        map.addLayer({
            "id": "regression",
            "type": "line",
            "source": "gbif",
            "source-layer": "regression",
            "paint": {
                "line-color": "#7b7b7b",
                "line-width": 0.5,
                "line-opacity": 0.5
            }
        });

        map.addLayer({
            "id": "regression-fill",
            "type": "fill",
            "source": "gbif",
            "source-layer": "regression",
            "paint": {
                "fill-color": {
                    property: 'slope',
                    stops: [
                        [-0.005, 'green'],
                        [-0.002, 'yellow'],
                        [0, 'white'],
                        [0.002, 'blue'],
                        [0.005, 'red']
                    ]
                },
                "fill-opacity": 0.4
            }
        });

        //a layer that activates only on a hover over a feature (a cell)
        map.addLayer({
            "id": "regression-fill-hover",
            "type": "fill",
            "source": "gbif",
            "source-layer": "regression",
            "paint": {
                "fill-color": "#FCA107",
                "fill-opacity": 0.6
            },
            "filter": ['==', "id", ""]
        });

        map.on('mousemove', function (e) {
            if (!map.getLayer('regression-fill-hover')) return;
            var features = map.queryRenderedFeatures(e.point, {layers: ["regression-fill"]});
            map.getCanvas().style.cursor = (features.length > 0) ? 'pointer' : '';
            if (features.length > 0) {
                map.setFilter("regression-fill-hover", ["==", "id", features[0].properties.id]);
            } else {
                map.setFilter("regression-fill-hover", ["==", "id", ""]);
            }
        });

    });

}

module.exports = speciesPopulationCtrl;
