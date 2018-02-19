'use strict';

var ol = require('openlayers'),
    proj4 = require('proj4'),
    querystring = require('querystring');

ol.proj.setProj4(proj4);

proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees');


angular
    .module('portal')
    .factory('GBIFNetworkMapService', function() {
        var tile_size = 512;
        var max_zoom = 14;
        var pixel_ratio = parseInt(window.devicePixelRatio) || 1;

       var getLayer = function(baseUrl, proj, params) {
            params = params || {};
            params.srs = proj.srs;
            delete params.progress;
            var source = new ol.source.TileImage({
                projection: proj.projection,
                tileGrid: proj.tileGrid,
                tilePixelRatio: 1,
                url: baseUrl + querystring.stringify(params),
                wrapX: proj.wrapX
            });


            return new ol.layer.Tile({
                extent: proj.extent,
                source: source,
                useInterimTilesOnError: false,
                visible: true
            });
        };

    return {

        get4326: function() {
            var extent = 180.0;
            var resolutions = Array(max_zoom + 1).fill().map(function(_, i) {
                return extent / tile_size / Math.pow(2, i);
            });

            var tile_grid_16 = new ol.tilegrid.TileGrid({
                extent: ol.proj.get('EPSG:4326').getExtent(),
                minZoom: 0,
                maxZoom: max_zoom,
                resolutions: resolutions,
                tileSize: tile_size
            });
            return {
                name: 'EPSG_4326',
                wrapX: true,
                srs: 'EPSG:4326',
                projection: 'EPSG:4326',
                epsg: 4326,
                // tile_grid_14: tile_grid_14,
                tileGrid: tile_grid_16,
                resolutions: resolutions,
                fitExtent: [-1, -80, 1, 80],
                getView: function(lat, lon, zoom, minZoom, maxZoom) {
                    lat = lat || 0;
                    lon = lon || 0;
                    zoom = zoom || 0;
                    minZoom = minZoom || 0;
                    maxZoom = max_zoom || 0;
                    return new ol.View({
                        maxZoom: maxZoom,
                        minZoom: minZoom,
                        center: [lon, lat],
                        zoom: zoom,
                        projection: 'EPSG:4326'
                    });
                },
                getBaseLayer: function(params) {
                    return getLayer('//tile.gbif.org/4326/omt/{z}/{x}/{y}@' + pixel_ratio + 'x.png?', this, params);
                }
            };
        }


    };
    });

