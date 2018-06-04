'use strict';

var ol = require('openlayers'),
    _ = require('lodash'),
    Progress = require('../mapWidget/progress'),
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
    var currentProjection = projections.EPSG_4326;

    this.update = function(options) {
        options = options || {};
        baseMapStyle = options.baseMap || baseMapStyle || {style: 'gbif-geyser-en'};
        overlayStyle = options.overlay || overlayStyle || {};
        filters = options.filters || filters || {};
        map.getLayers().clear();
        source.clear();
        map.setView(currentProjection.getView(0, 0, 1));

        map.addLayer(currentProjection.getBaseLayer(_.assign({}, baseMapStyle, {progress: progress})));
        map.addLayer(drawLayer);

        filters = _.omitBy(_.clone(filters), function(e) {
            return _.isUndefined(e);
        });
        if (overlayStyle.length == 0) {
            overlayStyle.push({});
        }
        if (_.isArray(overlayStyle)) {
            overlayStyle.forEach(function(overlay) {
                map.addLayer(currentProjection.getAdhocLayer(_.assign({}, overlay, filters, {progress: progress})));
            });
        }


        if (options.fitExtent && options.filters.geometry) {
            setTimeout(function() {
                map.getView().fit(ol.proj.transformExtent(extentFromWKT(options.filters.geometry), 'EPSG:4326', 'EPSG:4326'), {size: map.getSize(), nearest: false});

                initGeometry(options.filters.geometry);
            });
        } else if (currentProjection.fitExtent) {
            map.getView().fit(currentProjection.fitExtent, {nearest: true, maxZoom: 12, minZoom: 0});
        }
    };

    var extentFromWKT = function(wkt) {
        var format = new ol.format.WKT();
        if (_.isArray(wkt)) {
            var coll = new ol.geom.GeometryCollection(wkt.map(function(w) {
                return format.readGeometry(w);
            }));
            return coll.getExtent();
        } else {
            var geom = format.readGeometry(wkt);
            return geom.getExtent();
        }
    };

    var dragAndDropInteraction = new ol.interaction.DragAndDrop({
        formatConstructors: [
            ol.format.GPX,
            ol.format.GeoJSON,
            ol.format.IGC,
            ol.format.KML,
            ol.format.TopoJSON
        ]
    });

    var map = new ol.Map({
        interactions: ol.interaction.defaults().extend([dragAndDropInteraction]),
        target: mapElement,
        logo: false,
        controls: ol.control.defaults({zoom: false, attribution: false})

    });


   // var drawLayer;
    var source = new ol.source.Vector({wrapX: true});
    var drawLayer = new ol.layer.Vector({
        source: source
    });
    drawLayer.setZIndex(100);

    var modify = new ol.interaction.Modify({source: source});
    var snap = new ol.interaction.Snap({source: source});
    map.addInteraction(snap);
    map.addInteraction(modify);
    map.addLayer(drawLayer);
    var format = new ol.format.WKT();
    var geoJsonFormatter = new ol.format.GeoJSON();
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
            draw = new ol.interaction.Draw({
                source: source,
                type: 'Circle',
                geometryFunction: ol.interaction.Draw.createBox()
            });
        } else {
            draw = new ol.interaction.Draw({
                source: source,
                type: type
            });
            snap = new ol.interaction.Snap({source: source});
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
       clickSource = new ol.source.Vector({wrapX: true});
        exploreArea = new ol.interaction.Draw({
            source: clickSource,
            type: 'Circle',
            geometryFunction: ol.interaction.Draw.createBox()
        });

        clickedGeometryLayer = new ol.layer.Vector({
            source: clickSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'green',
                    width: 2
                }),
                fill: new ol.style.Fill({
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
        ol.Observable.unByKey(deleteListener);
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

    this.update(options);

    this.getViewExtent = function() {
        var e = map.getView().calculateExtent(map.getSize());
        return ol.proj.transformExtent(e, currentProjection.srs, 'EPSG:4326');
    };

    this.getProjection = function() {
        return currentProjection.name;
    };

    this.getProjectedCoordinate = function(coordinate) {
        return ol.proj.transform(coordinate, currentProjection.srs, 'EPSG:4326');
    };

    this.setExtent = function(extent) {
        map.getView().fit(ol.proj.transformExtent(extent, 'EPSG:4326', currentProjection.srs), map.getSize());
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
