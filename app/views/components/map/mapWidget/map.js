'use strict';

var ol = require('openlayers'),
    _ = require('lodash'),
    Progress = require('./progress'),
    // utils = require('../../../shared/layout/html/utils/utils'),
    projections = require('./projections');

module.exports = {
    createMap: createMap
};

function createMap(element, options) {
    var mapElement = element[0].querySelector('.mapWidget__mapArea');
    var progressElement = element[0].querySelector('.mapWidget__progress');
    var progress = new Progress(progressElement);

    options = options || {};
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
                map.getView().fit(currentProjection.fitExtent, {nearest: true, maxZoom: 12, minZoom: 0});
            }
        }
        map.addLayer(currentProjection.getBaseLayer(_.assign({}, baseMapStyle, {progress: progress})));

        if (overlayStyle.length == 0) {
            overlayStyle.push({});
        }
        if (_.isArray(overlayStyle)) {
            // var isSimple = utils.isSimpleQuery(filters);
            overlayStyle.forEach(function (overlay) {
                map.addLayer(currentProjection.getOccurrenceLayer(_.assign({}, overlay, filters, {progress: progress})));
                // if (isSimple) {
                //     map.addLayer(currentProjection.getOccurrenceLayer(_.assign({}, overlay, filters, {progress: progress})));
                // } else {
                //     map.addLayer(currentProjection.getAdhocLayer(_.assign({}, overlay, filters, {progress: progress})));
                // }
            });
        }
    };

    var map = new ol.Map({
        target: mapElement,
        logo: false
    });
    this.update(options);

    this.getViewExtent = function () {
        var e = map.getView().calculateExtent(map.getSize());
        return ol.proj.transformExtent(e, currentProjection.srs, 'EPSG:4326');
    };

    this.getProjection = function () {
        return currentProjection.name;
    };

    this.getProjectedCoordinate = function (coordinate) {
        return ol.proj.transform(coordinate, currentProjection.srs, 'EPSG:4326');
    };

    this.setExtent = function (extent) {
        map.getView().fit(ol.proj.transformExtent(extent, 'EPSG:4326', currentProjection.srs), {
            nearest: true,
            maxZoom: 6,
            minZoom: 0
        });
    };

    return {
        map: map,
        update: this.update,
        on: function (str, action) {
            return map.on(str, action);
        },
        getViewExtent: this.getViewExtent,
        getProjection: this.getProjection,
        setExtent: this.setExtent,
        getProjectedCoordinate: this.getProjectedCoordinate
    };
}