'use strict';

var ol = require('ol'),
    interaction = require('ol/interaction'),
    control = require('ol/control'),
    proj = require('ol/proj'),
    DragAndDrop = require('ol/interaction/DragAndDrop').default,
    Draw = require('ol/interaction/Draw').default,
    createBox = require('ol/interaction/Draw').createBox,
    GeoJSON = require('ol/format/GeoJSON').default,
    IGC = require('ol/format/IGC').default,
    KML = require('ol/format/KML').default,
    TopoJSON = require('ol/format/TopoJSON').default,
    GPX = require('ol/format/GPX').default,
    Vector = require('ol/source/Vector').default,
    WKT = require('ol/format/WKT').default,
    GeometryCollection = require('ol/geom/GeometryCollection').default,
    LayerVector = require('ol/layer/Vector').default,
    Modify = require('ol/interaction/Modify').default,
    Snap = require('ol/interaction/Snap').default,
    Style = require('ol/style/Style').default,
    Stroke = require('ol/style/Stroke').default,
    Fill = require('ol/style/Fill').default,
    unByKey = require('ol/Observable').unByKey,
    _ = require('lodash'),
    Progress = require('../mapWidget/progress'),
    optionsConfig = require('../mapWidget/options'),
    projections = require('../mapWidget/projections');


module.exports = {
    createMap: createMap
};


function createMap(element, options) {
    var mapElement = element[0].querySelector('.mapWidget__mapArea');
    var progressElement = element[0].querySelector('.mapWidget__progress');
    var progress = new Progress(progressElement);

    options = options || {};
    var baseMapStyle = options.baseMap || {style: 'gbif-geyser-en'};
    var overlayStyle = options.overlays || [];
    var filters = options.filters || {};
    var currentProjection;// = projections.EPSG_3575;

    // this.update = function(options, resetView) {
    //     options = options || {};
    //     baseMapStyle = options.baseMap || baseMapStyle || {style: 'gbif-geyser-en'};
    //     overlayStyle = options.overlay || overlayStyle || {};
    //     filters = options.filters || filters || {};
    //     map.getLayers().clear();
    //     source.clear();
    //     if (resetView) {
    //         map.setView(currentProjection.getView(0, 0, 1));
    //     }

    //     map.addLayer(currentProjection.getBaseLayer(_.assign({}, baseMapStyle, {progress: progress})));
    //     map.addLayer(drawLayer);

    //     filters = _.omitBy(_.clone(filters), function(e) {
    //         return _.isUndefined(e);
    //     });
    //     if (overlayStyle.length == 0) {
    //         overlayStyle.push({});
    //     }
    //     if (_.isArray(overlayStyle)) {
    //         overlayStyle.forEach(function(overlay) {
    //             map.addLayer(currentProjection.getAdhocLayer(_.assign({}, overlay, filters, {progress: progress})));
    //         });
    //     }

    //     if (options.filters.geometry) {
    //         initGeometry(options.filters.geometry);
    //     }

    //     if (options.fitExtent) {
    //         if (options.filters.geometry) {
    //             setTimeout(function() {
    //                 map.getView().fit(/* ol. */proj.transformExtent(extentFromWKT(options.filters.geometry), 'EPSG:4326', 'EPSG:4326'), {size: map.getSize(), nearest: false});
    //             });
    //         } else if (currentProjection.fitExtent) {
    //             map.getView().fit(currentProjection.fitExtent, {nearest: true, maxZoom: 12, minZoom: 0});
    //         }
    //     }
    // };
    this.update = function(options) {
        options = options || {};
        baseMapStyle = options.baseMap || baseMapStyle || {style: 'gbif-classic'};
        if (optionsConfig.localizedStyles[baseMapStyle.style]) {
            baseMapStyle.style += '-' + locale;
        }

        overlayStyle = options.overlay || overlayStyle || {};
        filters = options.filters || filters || {};
        filters = _.omitBy(_.clone(filters), function(e) {
            return _.isUndefined(e);
        });
        map.getLayers().clear();
        source.clear();
        if (!currentProjection || (options.projection && options.projection != currentProjection.name)) {
            currentProjection = projections[options.projection] || currentProjection || projections.EPSG_4326;
            map.setView(currentProjection.getView(0, 0, 1));
            if (currentProjection.fitExtent) {
                map.getView().fit(currentProjection.fitExtent, {constrainResolution: false, maxZoom: 12, minZoom: 0});
            }
        }
        map.addLayer(currentProjection.getBaseLayer(_.assign({}, baseMapStyle, {progress: progress})));
        if (currentProjection.srs === 'EPSG:4326') {
            map.addLayer(drawLayer);
        }

        if (overlayStyle.length == 0) {
            overlayStyle.push({});
        }
        if (_.isArray(overlayStyle)) {
            overlayStyle.forEach(function(overlay) {
                map.addLayer(currentProjection.getAdhocLayer(_.assign({}, overlay, filters, {progress: progress})));
            });
        }

        if (filters.geometry && currentProjection.srs === 'EPSG:4326') {
            initGeometry(filters.geometry);
        }
    };

    // var extentFromWKT = function(wkt) {
    //     var format = new /* ol.format. */WKT();
    //     if (_.isArray(wkt)) {
    //         var coll = new /* ol.geom. */GeometryCollection(wkt.map(function(w) {
    //             return format.readGeometry(w);
    //         }));
    //         return coll.getExtent();
    //     } else {
    //         var geom = format.readGeometry(wkt);
    //         return geom.getExtent();
    //     }
    // };

    var dragAndDropInteraction = new /* ol.interaction. */DragAndDrop({
        formatConstructors: [
            /* ol.format. */GPX,
           /*  ol.format. */GeoJSON,
            /* ol.format. */IGC,
            /* ol.format. */KML,
            /* ol.format. */TopoJSON
        ]
    });

    var scaleControl = new control.ScaleLine({
        units: 'metric',
        bar: false,
        steps: 4,
        text: true,
        target: document.getElementById('mapWidget_olScale')
    });

    var map = new ol.Map({
        // I'm disabling the drag'ndrop upload as it leads to conflict with projections. I'm sure it can be solved, but it is my impression no one knows and use this feature anyway.
        // interactions: /* ol. */interaction.defaults().extend([dragAndDropInteraction]),
        target: mapElement,
        logo: false,
        controls: /* ol. */control.defaults({zoom: false, attribution: false}).extend([scaleControl])
    });


   var drawLayer;
    var source = new /* ol.source. */Vector({wrapX: true});
    var drawLayer = new /* ol.layer. */LayerVector({
        source: source
    });
    drawLayer.setZIndex(100);

    var modify = new /* ol.interaction. */Modify({source: source});
    var snap = new /* ol.interaction. */Snap({source: source});
    map.addInteraction(snap);
    map.addInteraction(modify);
    map.addLayer(drawLayer);
    var format = new /* ol.format. */WKT();
    var geoJsonFormatter = new /* ol.format. */GeoJSON();
    var draw;
    var exploreArea;
    function disableDraw() {
        map.removeInteraction(draw);
        map.removeInteraction(snap);
    }
    function createFeatures(cb) {
        setTimeout(function() {
            var geometries = [];

            source.forEachFeature(function(f) {
                var asGeoJson = geoJsonFormatter.writeFeature(f, {rightHanded: true});
                var rightHandCorrectedFeature = geoJsonFormatter.readFeature(asGeoJson);
                geometries.push(format.writeFeature(rightHandCorrectedFeature, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:4326',
                    rightHanded: true,
                    decimals: 5
                }));
            });

            if (cb) {
                cb(geometries);
            }
            map.removeInteraction(draw);
        });
    }
    function enableDraw(type, cb) {
        map.removeInteraction(exploreArea);
        if (type === 'Rectangle') {
            draw = new /* ol.interaction. */Draw({
                source: source,
                type: 'Circle',
                geometryFunction: /* ol.interaction.Draw. */createBox()
            });
        } else {
            draw = new /* ol.interaction. */Draw({
                source: source,
                type: type
            });
            snap = new /* ol.interaction. */Snap({source: source});
            map.addInteraction(snap);
        }
        map.addInteraction(draw);

        draw.on('drawend', function() {
            createFeatures(cb);
        });
    }
    function enableModify(cb) {
        modify.on('modifyend', function() {
            createFeatures(cb);
        });
    }
    function enableDragDrop(cb) {
        dragAndDropInteraction.on('addfeatures', function(event) {
            var geometries = [];
            event.features.forEach(function(f) {
                var original = f.getGeometry();

                if (typeof original.getPolygons === 'function') {
                    var polys = original.getPolygons();
                    for (var i = 0; i < polys.length; i++) {
                        geometries.push(new ol.Feature({geometry: polys[i]}));
                    }
                } else {
                    geometries.push(new ol.Feature({geometry: original}));
                }
            });

            source.addFeatures(geometries);
            map.getView().fit(source.getExtent());


            setTimeout(function() {
                var wkt = geometries.map(function(f) {
                    var w = format.writeGeometry(f.getGeometry());


                    return w;
                });

                if (cb) {
                    cb(wkt);
                }
            });
        });
    }

    var clickedGeometryLayer;
    var clickSource;
    function enableClickGeometry(cb) {
        map.removeInteraction(draw);
        map.removeInteraction(snap);
       clickSource = new /* ol.source. */Vector({wrapX: true});
        exploreArea = new /* ol.interaction. */Draw({
            source: clickSource,
            type: 'Circle',
            geometryFunction: /* ol.interaction.Draw */createBox()
        });

        clickedGeometryLayer = new /* ol.layer. */LayerVector({
            source: clickSource,
            style: new /* ol.style. */Style({
                stroke: new /* ol.style. */Stroke({
                    color: 'green',
                    width: 2
                }),
                fill: new /* ol.style. */Fill({
                    color: 'rgba(173,255,47, 0.1)'
                })
            })
        });
        map.addLayer(clickedGeometryLayer);

        map.addInteraction(exploreArea);


        exploreArea.on('drawend', function(evt) {
            setTimeout(function() {
                var geometries = [];
                clickSource.forEachFeature(function(f) {
                    var asGeoJson = geoJsonFormatter.writeFeature(f, {rightHanded: true});
                    var rightHandCorrectedFeature = geoJsonFormatter.readFeature(asGeoJson);
                    geometries.push(format.writeFeature(rightHandCorrectedFeature, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:4326',
                        rightHanded: true,
                        decimals: 5
                    }));
                });

                if (cb) {
                    cb(geometries);
                }
                map.removeInteraction(exploreArea);
                map.addInteraction(snap);
            });
        });
    }
    function removeClickedQuery() {
        if (clickSource) {
            clickSource.clear();
        }
    }
    function initGeometry(geometry) {
        var geometries = [];
        if (_.isArray(geometry)) {
            var polys = geometry;
            for (var i = 0; i < polys.length; i++) {
                geometries.push(format.readFeature(polys[i], {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:4326'
                }));
            }
        } else {
            geometries.push(format.readFeature(geometry, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:4326'
            }));
        }
        source.addFeatures(geometries);
    }

    function removeDrawnItems() {
        source.clear();
    }

    var deleteListener;

    function exitDeleteMode() {
       if (deleteListener) {
       /*  ol.Observable */ unByKey(deleteListener);
       }
    }
    function deleteMode(cb) {
        var geometries = [];
        map.removeInteraction(snap);
        map.removeInteraction(modify);
        var deleteFeatureAtPixel = function(pixel) {
            map.forEachFeatureAtPixel(pixel, function(feature) {
                source.removeFeature(feature);
            });
        };
        deleteListener = map.once('click', function(evt) {
            deleteFeatureAtPixel(evt.pixel);
            source.forEachFeature(function(f) {
                var asGeoJson = geoJsonFormatter.writeFeature(f, {rightHanded: true});
                var rightHandCorrectedFeature = geoJsonFormatter.readFeature(asGeoJson);
                geometries.push(format.writeFeature(rightHandCorrectedFeature, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:4326',
                    rightHanded: true,
                    decimals: 5
                }));
            });
            cb(geometries);
            setTimeout(function() {
                map.addInteraction(snap);
                map.addInteraction(modify);
            });
        });
    }

    this.update(options, true);

    this.getViewExtent = function() {
        var e = map.getView().calculateExtent(map.getSize());
        return /* ol. */proj.transformExtent(e, currentProjection.srs, 'EPSG:4326');
    };

    this.getProjection = function() {
        return currentProjection.name;
    };

    this.getProjectedCoordinate = function(coordinate) {
        return /* ol. */proj.transform(coordinate, currentProjection.srs, 'EPSG:4326');
    };

    this.setExtent = function(extent) {
        map.getView().fit(/*ol. */proj.transformExtent(extent, 'EPSG:4326', currentProjection.srs), {
            constrainResolution: false,
            maxZoom: 6,
            minZoom: 0,
            size: map.getSize()
        });
    };


    return {
        map: map,
        enableDraw: enableDraw,
        disableDraw: disableDraw,
        enableModify: enableModify,
        deleteMode: deleteMode,
        exitDeleteMode: exitDeleteMode,
        enableClickGeometry: enableClickGeometry,
        removeClickedQuery: removeClickedQuery,
        enableDragDrop: enableDragDrop,
        removeDrawnItems: removeDrawnItems,
        update: this.update,
        on: function(str, action) {
            return map.on(str, action);
        },
        getViewExtent: this.getViewExtent,
        getProjection: this.getProjection,
        setExtent: this.setExtent,
        getProjectedCoordinate: this.getProjectedCoordinate
    };
}
