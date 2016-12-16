"use strict";



var map, Draw;
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ';

//var colors = [
//    '#a50f15',
//    '#de2d26',
//    '#fb6a4a',
//    '#fcae91',
//    '#fee5d9',
//    '#edf8e9',
//    '#bae4b3',
//    '#74c476',
//    '#31a354',
//    '#006d2c'
//];

var colors = [
    '#fc354c',
    '#bf5868',
    '#e8e8e8',
    '#459da1',
    '#0bbebb'
];

colors = [
    //'#30af30',
    '#91bd91',
    //'#499849',
    'black',
    //'#e8bc2f',
    'tomato'
].reverse();

var breakpoints = colors.reverse().map(function (e, i) {
    return [(colors.length - 6 - i) * 0.0002, e];
}).reverse();
breakpoints = [
    [-100000, 'tomato'],
    [-0.002, '#ffa047'],
    [-0.001, '#aecec3'],
    [0.001, '#91bd91'],
    [0.002, '#72ab72']
];

var outlineBreakpoints = [
    [-100000, '#ededed'],
    //[-0.001, 'tomato'],
    [-0.001, '#ededed'],
    //[0.0003, '#91bd91'],
    [0.001, '#ededed']
];

console.log(breakpoints);

var mapStyle = {
    "version": 8,
    "name": "Light",
    "sources": {
        "mapbox": {
            "type": "vector",
            "url": "mapbox://mapbox.mapbox-streets-v6"
        }
    },
    "sprite": "mapbox://sprites/mapbox/light-v9",
    "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    "layers": [
        {
            "id": "background",
            "type": "background",
            "paint": {"background-color": "#ededed"}//
        },
        {
            "id": "water",
            "source": "mapbox",
            "source-layer": "water",
            "type": "fill",
            "paint": {"fill-color": "#cdd5d8"}//d6d6d6
        }
    ]
};

function createMap(callbacks) {
    callbacks = callbacks || {};
    map = new mapboxgl.Map({
        container: 'speciesPopulationMap',
        style: 'mapbox://styles/mapbox/light-v9',//mapStyle,
        center: [10, 50],
        zoom: 3,
        bearing: 0,
        pitch: 0,
        maxZoom: 7.9,
        hash: false
    });

    //to change draw styles see https://github.com/mapbox/mapbox-gl-draw/blob/master/EXAMPLES.md
    Draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: true,
            trash: true
        }
    });
    map.addControl(Draw);

    map.on('load', function() {
        if (callbacks.onLoad) {
            callbacks.onLoad();
        }
    });

    map.on('style.load', function () {
        if (callbacks.onStyleLoad) {
            callbacks.onStyleLoad();
        }
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

    if (map.getLayer('groupPoints')) map.removeLayer('groupPoints');
    if (map.getSource('groupPoints')) map.removeSource('groupPoints');
}

function updateOverlays(query) {
    removeOverlays();
    var regressionTiles = '//api.gbif-uat.org/v2/map/occurrence/regression/{z}/{x}/{y}.mvt?' + query;//'http://tiletest.gbif.org/' + key + '/{z}/{x}/{y}/' + type + ".pbf?minYear=" + minYear + "&maxYear=" + maxYear + "&yearThreshold=" + yearThreshold + "&radius=" + hexRadius;

    var groupPointTiles = '//api.gbif-uat.org/v2/map/occurrence/density/{z}/{x}/{y}.mvt?srs=EPSG:3857&basisOfRecord=OBSERVATION&basisOfRecord=HUMAN_OBSERVATION&basisOfRecord=MACHINE_OBSERVATION&basisOfRecord=MATERIAL_SAMPLE&basisOfRecord=PRESERVED_SPECIMEN&taxonKey=7017';
    map.addSource('groupPoints', {
        type: 'vector',
        "tiles": [groupPointTiles]
    });
    map.addLayer({
        "id": "groupPoints",
        "type": "circle",
        "source": "groupPoints",
        "source-layer": "occurrence",
        "paint": {
            "circle-radius": 1.5,
            'circle-color': '#444',
            "circle-opacity": 0.1
            //'circle-opacity': {
            //    property: 'total',
            //    stops: [
            //        [100, 0.5],
            //        [1000, 0.6],
            //        [10000, 0.7],
            //        [100000, 0.8]]
            //}
            //"circle-color": 'red'
        }
    });

    map.addSource('gbifRegression', {
        type: 'vector',
        "tiles": [regressionTiles]
    });


    map.addLayer({
        "id": "regression-fill",
        "type": "fill",
        "source": "gbifRegression",
        "source-layer": "regression",
        "paint": {
            //"fill-pattern": 'circle-11',
            "fill-color": {
                property: 'slope',
                "type": "interval",
                stops: breakpoints
            },
            "fill-outline-color": {
                property: 'slope',
                "type": "interval",
                stops: outlineBreakpoints
            },//'#ededed',
            "fill-opacity": 0.6
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
            "fill-opacity": 0.4
        },
        "filter": ['==', "id", ""]
    });

    //map.addLayer({
    //    "id": "regression",
    //    "type": "line",
    //    "source": "gbifRegression",
    //    "source-layer": "regression",
    //    "paint": {
    //        "line-color": "#f6f6f4",//7b7b7b
    //        "line-width": 0.5,
    //        "line-opacity": 0.7
    //    }
    //});


}

function hoverEventListener(e) {
    if (!map.getLayer('regression-fill-hover')) return;
    var features = map.queryRenderedFeatures(e.point, {layers: ["regression-fill"]});
    map.getCanvas().style.cursor = (features.length > 0) ? 'pointer' : '';
    if (features.length > 0) {
        map.setFilter("regression-fill-hover", ["==", "id", features[0].properties.id]);
    } else {
        map.setFilter("regression-fill-hover", ["==", "id", ""]);
    }
}

function addHoverEventListener() {
    map.on('mousemove', hoverEventListener);
}

function removeHoverEventListener() {
    map.off('mousemove', hoverEventListener);
}

var eventListeners = {
};
function addMapEvents(listeners) {
    eventListeners = listeners;
    if (!map) {
        return;
    }
    if (eventListeners.onCreate) {
        map.on('draw.create', eventListeners.onCreate);
    }

    if (eventListeners.onDelete) {
        map.on('draw.delete', eventListeners.onDelete);
    }

    if (eventListeners.onUpdate) {
        map.on('draw.update', eventListeners.onUpdate);
    }
}

/**
 *  Create the hover over effects on mouse moving.
 */
function selectFeatureAtPoint(e) {
    if (!map.getLayer('regression-fill')) return;
    var features = map.queryRenderedFeatures(e.point, {layers: ["regression-fill"]});
    console.log(features);
    if (features.length > 0) {
        var feature = features[0];
        var selectedHexagon = Draw.set({type: 'FeatureCollection', features: [{
            type: 'Feature',
            properties: feature.properties,
            id: 'selected-hexagon',
            geometry: feature.geometry
        }]});
        if (eventListeners.onHexagonSelect) {
            eventListeners.onHexagonSelect(feature.properties, feature);
        }
        //chart.showStats(feature.properties);
    }
}

module.exports = {
    createMap: createMap,
    updateOverlays: updateOverlays,
    addMapEvents: addMapEvents,
    addHoverEventListener: addHoverEventListener,
    removeHoverEventListener: removeHoverEventListener
};