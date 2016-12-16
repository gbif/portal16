"use strict";

var map, Draw;
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ';

var breakpoints = [
    [-100000, 'tomato'],
    [-0.002, '#ffa047'],
    [-0.001, '#aecec3'],
    [0.001, '#91bd91'],
    [0.002, '#72ab72']
];
//var mapStyle = {
//    "version": 8,
//    "name": "Light",
//    "sources": {
//        "mapbox": {
//            "type": "vector",
//            "url": "mapbox://mapbox.mapbox-streets-v6"
//        }
//    },
//    "sprite": "mapbox://sprites/mapbox/light-v9",
//    "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
//    "layers": [
//        {
//            "id": "background",
//            "type": "background",
//            "paint": {"background-color": "#ededed"}//
//        },
//        {
//            "id": "water",
//            "source": "mapbox",
//            "source-layer": "water",
//            "type": "fill",
//            "paint": {"fill-color": "#cdd5d8"}//d6d6d6
//        }
//    ]
//};

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


}


function removeOverlays() {
    if (map.getLayer('regression')) map.removeLayer('regression');
    if (map.getLayer('regression-fill')) map.removeLayer('regression-fill');
    if (map.getSource('gbifRegression')) map.removeSource('gbifRegression');

    if (map.getLayer('groupPoints')) map.removeLayer('groupPoints');
    if (map.getSource('groupPoints')) map.removeSource('groupPoints');
}

function updateOverlays(query) {
    removeOverlays();
    var regressionTiles = 'https://api.gbif-uat.org/v2/map/occurrence/regression/{z}/{x}/{y}.mvt?' + query;

    var groupPointTiles = 'https://api.gbif-uat.org/v2/map/occurrence/density/{z}/{x}/{y}.mvt?srs=EPSG:3857&basisOfRecord=OBSERVATION&basisOfRecord=HUMAN_OBSERVATION&basisOfRecord=MACHINE_OBSERVATION&basisOfRecord=MATERIAL_SAMPLE&basisOfRecord=PRESERVED_SPECIMEN&' + query;
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
            "fill-color": {
                property: 'slope',
                "type": "interval",
                stops: breakpoints
            },
            "fill-outline-color": '#ededed',
            "fill-opacity": 0.6
        }
    });

}

function hoverEventListener(e) {
    var features = map.queryRenderedFeatures(e.point, {layers: ["regression-fill"]});
    map.getCanvas().style.cursor = (features.length > 0) ? 'pointer' : '';
}

function addHoverEventListener() {
    map.on('mousemove', hoverEventListener);
}

function removeHoverEventListener() {
    map.off('mousemove', hoverEventListener);
}

function addHexagonSelection() {
    map.on('click', selectFeatureAtPoint);
}

function removeHexagonSelection() {
    map.off('click', selectFeatureAtPoint);
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

function startDraw() {
    Draw.deleteAll();
    Draw.changeMode('draw_polygon');
    removeHexagonSelection();
    removeHoverEventListener();
}

function startHexagonSelection() {
    Draw.deleteAll();
    Draw.changeMode('simple_select');
    addHoverEventListener();
    addHexagonSelection();
}

function clearSelection(hexagon) {
    if (hexagon) {
        startHexagonSelection();
    } else {
        startDraw();
    }
    //Draw.deleteAll();
    //Draw.changeMode('simple_select');
    //removeHexagonSelection();
    //removeHoverEventListener();
}

/**
 *  Select feature from point and notify listener
 */
function selectFeatureAtPoint(e) {
    if (!map.getLayer('regression-fill')) return;
    var features = map.queryRenderedFeatures(e.point, {layers: ["regression-fill"]});
    if (features.length > 0) {
        var feature = features[0];
        Draw.set({type: 'FeatureCollection', features: [{
            type: 'Feature',
            properties: feature.properties,
            id: 'selected-hexagon',
            geometry: feature.geometry
        }]});
        if (eventListeners.onHexagonSelect) {
            eventListeners.onHexagonSelect(feature.properties, feature);
        }
    }
}

module.exports = {
    createMap: createMap,
    updateOverlays: updateOverlays,
    addMapEvents: addMapEvents,
    startDraw: startDraw,
    startHexagonSelection: startHexagonSelection,
    clearSelection: clearSelection
};