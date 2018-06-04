'use strict';

var ol = require('openlayers'),
    _ = require('lodash'),
    projections = require('../map/mapWidget/projections');


module.exports = {
    createMap: createMap
};


function createMap(element, options) {
    var mapElement = element[0].querySelector('.mapWidget__mapArea');

    options = options || {};
    var filters = options.filters || {};
    var currentProjection = projections.EPSG_3857;

    this.update = function(options) {
        options = options || {};
        filters = options.filters || filters || {};

        filters = _.omitBy(_.clone(filters), function(e) {
            return _.isUndefined(e);
        });

        if (options.fitExtent && options.filters.geometry) {
            setTimeout(function() {
                map.getView().fit(ol.proj.transformExtent(extentFromWKT(options.filters.geometry), 'EPSG:4326', 'EPSG:3857'), {size: map.getSize(), nearest: false});

                initGeometry(options.filters.geometry);
            });
        } else if (currentProjection.fitExtent) {
            map.getView().fit(currentProjection.fitExtent, {nearest: true, maxZoom: 12, minZoom: 0});
        } else {
            map.setView(currentProjection.getView(0, 0, 2));
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
    var map = new ol.Map({
        target: mapElement,
        logo: false,
        controls: ol.control.defaults({zoom: false, attribution: false})

    });
    var source = new ol.source.Vector({wrapX: false});
    var drawLayer = new ol.layer.Vector({
        source: source
    });

    var modify = new ol.interaction.Modify({source: source});
    map.addInteraction(modify);

    map.addLayer(currentProjection.getBaseLayer(_.assign({}, {style: 'gbif-geyser-en'}, {})));

    map.addLayer(drawLayer);
    var format = new ol.format.WKT();
    var geoJsonFormatter = new ol.format.GeoJSON();
    var draw, snap;
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
                    featureProjection: 'EPSG:3857',
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
    function initGeometry(geometry) {
        var geometries = [];
       if (_.isArray(geometry)) {
           geometry = _.uniq(geometry);
       }
        if (_.isArray(geometry)) {
            var polys = geometry;
            for (var i = 0; i < polys.length; i++) {
                geometries.push(format.readFeature(polys[i], {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                }));
            }
        } else {
            geometries.push(format.readFeature(geometry, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
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
                    featureProjection: 'EPSG:3857',
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
        initGeometry: initGeometry,
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
