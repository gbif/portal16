'use strict';

var ol = require('ol'),
    proj4 = require('proj4'),
    olProj = require('ol/proj'),
    proj4_ = require('ol/proj/proj4'),
    querystring = require('querystring'),
    TileImage = require('ol/source/TileImage').default,
    Tile = require('ol/layer/Tile').default,
    TileGrid = require('ol/tilegrid/TileGrid').default;

// /*ol. */proj.setProj4(proj4);

proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees');
proj4_.register(proj4);


angular
    .module('portal')
    .factory('GBIFNetworkMapService', function() {
        var tileSize = 512;
        var maxZoom = 14;
        var pixelRatio = parseInt(window.devicePixelRatio) || 1;

       var getLayer = function(baseUrl, proj, params) {
            params = params || {};
            params.srs = proj.srs;
            delete params.progress;
            var source = new /* ol.source. */ TileImage({
                projection: proj.projection,
                tileGrid: proj.tileGrid,
                tilePixelRatio: 1,
                url: baseUrl + querystring.stringify(params),
                wrapX: proj.wrapX
            });


            return new /* ol.layer. */Tile({
                extent: proj.extent,
                source: source,
                useInterimTilesOnError: false,
                visible: true
            });
        };

    return {

        get4326: function() {
            var extent = 180.0;
            var resolutions = Array(maxZoom + 1).fill().map(function(_, i) {
                return extent / tileSize / Math.pow(2, i);
            });

            var tileGrid16 = new /* ol.tilegrid. */TileGrid({
                extent: /*ol. */olProj.get('EPSG:4326').getExtent(),
                minZoom: 0,
                maxZoom: maxZoom,
                resolutions: resolutions,
                tileSize: tileSize
            });
            return {
                name: 'EPSG_4326',
                wrapX: true,
                srs: 'EPSG:4326',
                projection: 'EPSG:4326',
                epsg: 4326,
                // tile_grid_14: tile_grid_14,
                tileGrid: tileGrid16,
                resolutions: resolutions,
                fitExtent: [-1, -80, 1, 80],
                getView: function(lat, lon, zoom, minZoom, maxZoom) {
                    lat = lat || 0;
                    lon = lon || 0;
                    zoom = zoom || 0;
                    minZoom = minZoom || 0;
                    maxZoom = maxZoom || 0;
                    return new ol.View({
                        maxZoom: maxZoom,
                        minZoom: minZoom,
                        center: [lon, lat],
                        zoom: zoom,
                        projection: 'EPSG:4326'
                    });
                },
                getBaseLayer: function(params) {
                    return getLayer('//tile.gbif.org/4326/omt/{z}/{x}/{y}@' + pixelRatio + 'x.png?', this, params);
                }
            };
        }


    };
    });

