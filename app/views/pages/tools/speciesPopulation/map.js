"use strict";

var map, Draw, mapApi;
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ';

var breakpoints = [
    [-100000, 'tomato'],
    [-0.002, '#fd7620'],
    [-0.001, '#ffa047'],
    [0, '#9bc7a8'],
    [0.001, '#91bd91'],
    [0.002, '#72ab72']
];

function createMap(options) {
    options = options || {};
    if (!options.dataapiv2) {
        return;
    }
    mapApi = 'https:' + options.dataapiv2 + 'map/';
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
        if (options.onLoad) {
            options.onLoad();
        }
    });

    map.on('style.load', function () {
        if (options.onStyleLoad) {
            options.onStyleLoad();
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

function updateOverlays(query, slopeStdErrThreshold) {
    slopeStdErrThreshold = slopeStdErrThreshold || 2; //show all per default
    removeOverlays();
    var regressionTiles = mapApi + 'occurrence/regression/{z}/{x}/{y}.mvt?' + query;

    var groupPointTiles = mapApi + 'occurrence/density/{z}/{x}/{y}.mvt?srs=EPSG:3857&basisOfRecord=OBSERVATION&basisOfRecord=HUMAN_OBSERVATION&basisOfRecord=MACHINE_OBSERVATION&basisOfRecord=MATERIAL_SAMPLE&basisOfRecord=PRESERVED_SPECIMEN&' + query;
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
             // "fill-opacity": {
             //     property: 'slopeStdErr',
             //     "type": "interval",
             //     stops: [
             //         [-1, 0.7],
             //         [slopeStdErrThreshold, 0.05]
             //     ]
             // }
        },
        "filter": ['<=', "slopeStdErr", slopeStdErrThreshold]
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