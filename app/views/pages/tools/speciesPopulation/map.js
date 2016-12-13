"use strict";

var chart = require('./chart');

var map;
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ';

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
var breakpoints = colors.reverse().map(function (e, i) {
    return [(colors.length - 6 - i) * 0.0002, e];
}).reverse();

var mapStyle = {
    "version": 8,
    "name": "Light",
    "sources": {
        "mapbox": {
            "type": "vector",
            "url": "mapbox://mapbox.mapbox-streets-v6"
        }
        //"gbif": {
        //    "type": "vector",
        //    //"tiles": ["http://localhost:7001/map/occurrence/regression/{z}/{x}/{y}.mvt?taxonKey=1898286&higherTaxonKey=797"]
        //    "tiles": ["http://api.gbif-uat.org/v2/map/occurrence/regression/{z}/{x}/{y}.mvt?taxonKey=1898286&higherTaxonKey=797"]
        //    //"tiles": ["http://localhost:7001/map/occurrence/regression/{z}/{x}/{y}.mvt?taxonKey=212&higherTaxonKey=1&srs=EPSG:4326&year=1990,2000"]
        //
        //    // taxonKey=4989904&higherTaxonKey=7782
        //}
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
        }
        //{
        //    "id": "gbifOccurrence",
        //    "source": "gbif",
        //    "source-layer": "occurrence",
        //    "type": "fill",
        //    "paint": {"fill-color": "#2c2c2c"}
        //}
    ]
};

function createMap() {
    map = new mapboxgl.Map({
        container: 'speciesPopulationMap',
        style: mapStyle,
        center: [10, 50],
        zoom: 3,
        bearing: 0,
        pitch: 0,
        maxZoom: 7.9,
        hash: false
    });

    var Draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: true,
            trash: true
        }
    });
    map.addControl(Draw);

    map.on('style.load', function () {
        updateOverlays();
    });

    /**
     * Set up the details when a user clicks a cell.
     */
    map.on('click', function (e) {
        selectFeatureAtPoint(e);
    });
}

function removeOverlays() {
    if (map.getLayer('regression')) map.removeLayer('regression');
    if (map.getLayer('regression-fill')) map.removeLayer('regression-fill');
    if (map.getLayer('regression-fill-hover')) map.removeLayer('regression-fill-hover');
    if (map.getSource('gbifRegression')) map.removeSource('gbifRegression');
}

function updateOverlays(higherTaxonKey, lowerTaxonKey, yearThreshold) {
    removeOverlays();
    console.log(higherTaxonKey, lowerTaxonKey);
    higherTaxonKey = higherTaxonKey || 797;
    lowerTaxonKey = lowerTaxonKey || 1898286;
    if (!higherTaxonKey || !lowerTaxonKey) {
        return;
    }

    var regressionTiles = 'http://api.gbif-uat.org/v2/map/occurrence/regression/{z}/{x}/{y}.mvt?taxonKey='+lowerTaxonKey+'&higherTaxonKey=' + higherTaxonKey;//'http://tiletest.gbif.org/' + key + '/{z}/{x}/{y}/' + type + ".pbf?minYear=" + minYear + "&maxYear=" + maxYear + "&yearThreshold=" + yearThreshold + "&radius=" + hexRadius;
    map.addSource('gbifRegression', {
        type: 'vector',
        "tiles": [regressionTiles]
    });

    map.addLayer({
        "id": "regression",
        "type": "line",
        "source": "gbifRegression",
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
        "source": "gbifRegression",
        "source-layer": "regression",
        "paint": {
            "fill-color": {
                property: 'slope',
                stops: breakpoints
            },
            "fill-opacity": 0.4
        }
    });

    //a layer that activates only on a hover over a feature (a cell)
    map.addLayer({
        "id": "regression-fill-hover",
        "type": "fill",
        "source": "gbifRegression",
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

}

function addMapEvents(listeners) {
    if (!map) {
        return;
    }
    if (listeners.onCreate) {
        map.on('draw.create', listeners.onCreate);
    }

    if (listeners.onDelete) {
        map.on('draw.delete', listeners.onDelete);
    }

    if (listeners.onUpdate) {
        map.on('draw.update', listeners.onUpdate);
    }
}

//scroll test. TODO what is the best way to go about this - is it necessary ?
//function scrollToResults() {
//    var topPos = document.getElementById('tester').offsetTop;
//    document.getElementById('speciesPopulation_scrollContainer').scrollTop = topPos-120;
//}

/**
 *  Create the hover over effects on mouse moving.
 */
function selectFeatureAtPoint(e) {
    if (!map.getLayer('regression-fill')) return;
    var features = map.queryRenderedFeatures(e.point, {layers: ["regression-fill"]});
    if (features.length > 0) {
        var data = features[0].properties;
        console.log(data);
        chart.showStats(data);
        //scrollToResults(); //more annoying than nice in this implementation
    }
}

module.exports = {
    createMap: createMap,
    updateOverlays: updateOverlays,
    addMapEvents: addMapEvents
};