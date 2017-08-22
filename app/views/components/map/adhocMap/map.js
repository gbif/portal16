'use strict';

var ol = require('openlayers'),
    _ = require('lodash'),
    Progress = require('../mapWidget/progress'),
    querystring = require('querystring'),
    projections = require('../mapWidget/projections');


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
    var currentProjection = projections.EPSG_4326;

    this.update = function (options) {
        options = options || {};
        baseMapStyle = options.baseMap || baseMapStyle || {style: 'gbif-classic'};
        overlayStyle = options.overlay || overlayStyle || {};
        filters = options.filters || filters || {};
        map.getLayers().clear();
        map.setView(currentProjection.getView(0, 0, 1));

        map.addLayer(currentProjection.getBaseLayer(_.assign({}, baseMapStyle, {progress: progress})));

        filters = _.omitBy(_.clone(filters), function(e){
            return _.isUndefined(e);
        });
        if (overlayStyle.length == 0) {
            overlayStyle.push({});
        }
        if (_.isArray(overlayStyle)) {
            //var isSimple = utils.isSimpleQuery(filters);
            overlayStyle.forEach(function (overlay) {
                map.addLayer(currentProjection.getAdhocLayer(_.assign({}, overlay, filters, {progress: progress})));
                //if (isSimple) {
                //    map.addLayer(currentProjection.getOccurrenceLayer(_.assign({}, overlay, filters, {progress: progress})));
                //} else {
                //    map.addLayer(currentProjection.getAdhocLayer(_.assign({}, overlay, filters, {progress: progress})));
                //}
            });
        }

        if(options.fitExtent && options.filters.geometry){
            setTimeout(function(){
                map.getView().fit(ol.proj.transformExtent(extentFromWKT(options.filters.geometry),'EPSG:4326', 'EPSG:4326'), {size: map.getSize(), nearest: false});

            });
        }
        else if (currentProjection.fitExtent) {
            map.getView().fit(currentProjection.fitExtent, {nearest: true, maxZoom: 12, minZoom: 0});
        }
    };

    var extentFromWKT = function(wkt){
        var format = new ol.format.WKT()
        if (_.isArray(wkt)){
            var coll = new ol.geom.GeometryCollection(wkt.map(function(w){
                return format.readGeometry(w);
            }))
            return coll.getExtent();
        } else {
            var geom = format.readGeometry(wkt);
            return geom.getExtent();
        }

    };


    var map = new ol.Map({
        target: mapElement,
        logo: false
    });
    // var testControl = new ol.control.ZoomToExtent({
    //     extent: extentFromWKT(options.filters.geometry)
    // });
    // map.addControl(testControl);
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
        map.getView().fit(ol.proj.transformExtent(extent, 'EPSG:4326', currentProjection.srs), map.getSize());
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