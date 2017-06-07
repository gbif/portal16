'use strict';

var ol = require('openlayers'),
    _ = require('lodash'),
    projections = require('./projections');

module.exports = {
    createMap: createMap
};

function createMap(element, options) {
    var mapElement = element[0].querySelector('.mapWidget__mapArea');
    var options = options || {};
    var baseMapStyle = options.baseMap || {style: 'gbif-classic'};
    var overlayStyle = options.overlays || [];
    var filters = options.filters || {};
    var currentProjection;

    this.update = function (options) {
        options = options || {};
        baseMapStyle = options.baseMap || baseMapStyle || {style: 'gbif-classic'};
        overlayStyle = options.overlay || overlayStyle || {};
        filters = options.filters || filters || {};
        map.getLayers().clear();
        if (!currentProjection || (options.projection && options.projection != currentProjection.name)) {
            currentProjection = projections[options.projection] || currentProjection || projections.EPSG_4326;
            map.setView(currentProjection.getView(0, 0, 1));
            if (currentProjection.fitExtent) {
                map.getView().fit(currentProjection.fitExtent);
            }
            window.map = map;
        }
        map.addLayer(currentProjection.getBaseLayer(baseMapStyle));

        if (overlayStyle.length > 0) {
            overlayStyle.forEach(function (overlay) {
                map.addLayer(currentProjection.getOccurrenceLayer(_.assign({}, overlay, filters)));
            });
        } else {
            map.addLayer(currentProjection.getOccurrenceLayer(filters));
        }
    };

    var map = new ol.Map({
        target: mapElement
    });
    map.on('singleclick', function (e) {
        console.log(ol.proj.transform(e.coordinate, currentProjection.srs, 'EPSG:4326'));
    });

    this.update(options);

    this.getViewExtent = function () {
        var e = map.getView().calculateExtent(map.getSize());
        return ol.proj.transformExtent(e, currentProjection.srs, 'EPSG:4326');
    };

    this.getProjection = function () {
        return currentProjection.name;
    };

    this.setExtent = function(extent) {
        map.getView().fit(ol.proj.transformExtent(extent, 'EPSG:4326', currentProjection.srs));
    };

    return {
        map: map,
        update: this.update,
        on: function (str, action) {
            return map.on(str, action);
        },
        getViewExtent: this.getViewExtent,
        getProjection: this.getProjection,
        setExtent: this.setExtent
    };
}
