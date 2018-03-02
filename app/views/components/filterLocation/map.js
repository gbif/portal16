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
    map.addLayer(currentProjection.getBaseLayer(_.assign({}, {style: 'gbif-geyser'}, {})));

    map.addLayer(drawLayer);
    var format = new ol.format.WKT();

    function enableDraw(type, cb) {
        var draw;
        if (type === 'Rectangle'){
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
        }
        map.addInteraction(draw);

        draw.on('drawend', function() {
            setTimeout(function() {
                var geometries = [];

                source.forEachFeature(function(f) {
                    geometries.push(format.writeGeometry(f.getGeometry(), {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:3857'
                    }));
                });
                if (cb) {
                    cb(geometries);
                }
                map.removeInteraction(draw);
            });
        });
    }
    function initGeometry(geometry) {
        var geometries = [];


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
        map.removeLayer(drawLayer);
        source = new ol.source.Vector({wrapX: false});
        drawLayer = new ol.layer.Vector({
            source: source
        });
        map.addLayer(drawLayer);
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
