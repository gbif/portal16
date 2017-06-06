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

    this.update = function(options){
        options = options || {};
        baseMapStyle = options.baseMap || baseMapStyle || {style: 'gbif-classic'};
        overlayStyle = options.overlay || overlayStyle || {};
        filters = options.filters || filters || {};
        map.getLayers().clear();
        if (!currentProjection || (options.projection && options.projection != currentProjection.name)) {
            currentProjection = projections[options.projection] || currentProjection || projections.EPSG_4326;
            map.setView(currentProjection.getView(0, 0, 1));
        }
        map.addLayer(currentProjection.getBaseLayer(baseMapStyle));

        if (overlayStyle.length > 0) {
            overlayStyle.forEach(function(overlay){
                console.log(overlay);
                map.addLayer(currentProjection.getOccurrenceLayer(_.assign({}, overlay, filters)));
            });
        } else {
            map.addLayer(currentProjection.getOccurrenceLayer(filters));
        }

    };

    var map = new ol.Map({
        target: mapElement
    });
    this.update(options);

    return {
        map: map,
        update: this.update
    };
}
