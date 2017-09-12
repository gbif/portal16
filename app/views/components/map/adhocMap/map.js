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
        controls: ol.control.defaults({zoom:false})

    });



    var drawLayer;
    var format = new ol.format.WKT();
    function enableDragDrop(cb) {
        dragAndDropInteraction.on('addfeatures', function (event) {


            var geometries =[];
            event.features.forEach(function (f) {
                var original = f.getGeometry();

                if(typeof original.getPolygons === 'function'){
                    var polys = original.getPolygons();
                    for(var i =0; i< polys.length; i++){
                        geometries.push(new ol.Feature({ geometry:polys[i]}));
                    }
                } else {
                    geometries.push(new ol.Feature({ geometry:original}));

                }


            })

            var vectorSource = new ol.source.Vector({
                features: geometries
            });


            drawLayer = new ol.layer.Vector({
                source: vectorSource
            })
            map.addLayer(drawLayer);

            map.getView().fit(vectorSource.getExtent());


            setTimeout(function() {
               var wkt = geometries.map(function (f) {

                   var w = format.writeGeometry(f.getGeometry());


                   return w;
                })

                if(cb){
                    cb(wkt);
                }
            })


        });
    }



    function enableDraw(cb){


        var source = new ol.source.Vector({wrapX: false});
        var draw = new ol.interaction.Draw({
            source: source,
            type: 'Circle',
            geometryFunction: ol.interaction.Draw.createBox()
        });

        drawLayer = new ol.layer.Vector({
            source: source
        });
        map.addLayer(drawLayer);

            map.addInteraction(draw)


        draw.on('drawend', function(evt){

            setTimeout(function() {
                source.forEachFeature(function (f) {
                    if(cb){
                       cb(format.writeGeometry(f.getGeometry()));
                    }
                    map.removeInteraction(draw);
                })
            })
            //console.log(evt)
        });
    }

    function removeDrawnItems(){
        map.removeLayer(drawLayer)
    }
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
        enableDraw: enableDraw,
        enableDragDrop: enableDragDrop,
        removeDrawnItems: removeDrawnItems,
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