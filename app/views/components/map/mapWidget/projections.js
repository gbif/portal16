'use strict';

var ol = require('openlayers'),
    proj4 = require('proj4'),
    querystring = require('querystring'),
    // env = require('../../../shared/layout/html/angular/env'),
    env = window.gb.env,
    baseMaps = require('./baseMapConfig');

ol.proj.setProj4(proj4);

proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees');
proj4.defs('EPSG:3575', '+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:3031', '+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');

// set up projections an dshared variables
var halfWidth = Math.sqrt(2) * 6371007.2;
var tileSize = 512;
var maxZoom = 18;
var pixelRatio = parseInt(window.devicePixelRatio) || 1;

function get4326() {
    var extent = 180.0;
    var resolutions = Array(maxZoom + 1).fill().map(function(_, i) {
        return extent / tileSize / Math.pow(2, i);
    });

    var tileGrid16 = new ol.tilegrid.TileGrid({
        extent: ol.proj.get('EPSG:4326').getExtent(),
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
        fitExtent: [-179, -1, 179, 1],
        getView: function(lat, lon, zoom) {
            lat = lat || 0;
            lon = lon || 0;
            zoom = zoom || 0;
            return new ol.View({
                maxZoom: maxZoom,
                minZoom: 0,
                center: [lon, lat],
                zoom: zoom,
                projection: 'EPSG:4326'
            });
        },
        getBaseLayer: function(params) {
            return getLayer(baseMaps.EPSG_4326.url, this, params);
        },
        getOccurrenceLayer: function(params) {
            return getLayer(env.dataApiV2 + 'map/occurrence/density/{z}/{x}/{y}@' + pixelRatio + 'x.png?', this, params);
        },
        getAdhocLayer: function(params) {
            params.srs = '4326';// only supports this projection
            return getAdhocLayer(env.dataApiV2 + 'map/occurrence/adhoc/{z}/{x}/{y}@' + pixelRatio + 'x.png?', this, params);
        }
    };
}


function get3857() {
    var tileGrid16 = ol.tilegrid.createXYZ({
        minZoom: 0,
        maxZoom: maxZoom,
        tileSize: tileSize
    });
    return {
        name: 'EPSG_3857',
        wrapX: true,
        srs: 'EPSG:3857',
        // projection: 'EPSG:3857',
        epsg: 3857,
        tileGrid: tileGrid16,
        // resolutions: resolutions,
        fitExtent: ol.proj.transformExtent([-90, -75, 90, 75], 'EPSG:4326', 'EPSG:3857'),
        getView: function(lat, lon, zoom) {
            lat = lat || 0;
            lon = lon || 0;
            zoom = zoom || 0;
            return new ol.View({
                maxZoom: maxZoom,
                minZoom: 0,
                center: [lon, lat],
                zoom: zoom,
                projection: 'EPSG:3857'
            });
        },
        getBaseLayer: function(params) {
            return getLayer(baseMaps.EPSG_3857.url, this, params);
        },
        getOccurrenceLayer: function(params) {
            return getLayer(env.dataApiV2 + 'map/occurrence/density/{z}/{x}/{y}@' + pixelRatio + 'x.png?', this, params);
        }
    };
}

function get3575() {
    var extent = [-halfWidth, -halfWidth, halfWidth, halfWidth];
    ol.proj.get('EPSG:3575').setExtent(extent);
    var resolutions = Array.from(new Array(maxZoom + 1), function(x, i) {
        return halfWidth / (tileSize * Math.pow(2, i - 1));
    });

    var tileGrid16 = new ol.tilegrid.TileGrid({
        extent: extent,
        origin: [-halfWidth, halfWidth],
        minZoom: 0,
        maxZoom: maxZoom,
        resolutions: resolutions,
        tileSize: tileSize
    });

    var getCenter = function() {
        return ol.proj.fromLonLat([0, 89], 'EPSG:3575');
    };

    return {
        name: 'EPSG_3575',
        wrapX: false,
        srs: 'EPSG:3575',
        projection: 'EPSG:3575',
        epsg: 3575,
        // tile_grid_14: tile_grid_14,
        tileGrid: tileGrid16,
        resolutions: resolutions,
        fitExtent: extent,
        getView: function(lat, lon, zoom) {
            return new ol.View({
                center: getCenter(lat, lon),
                projection: ol.proj.get('EPSG:3575'),
                zoom: zoom || 0,
                maxResolution: halfWidth / tileSize * 2
            });
        },
        getBaseLayer: function(params) {
            return getLayer(baseMaps.EPSG_3575.url, this, params);
        },
        getOccurrenceLayer: function(params) {
            return getLayer(env.dataApiV2 + 'map/occurrence/density/{z}/{x}/{y}@' + pixelRatio + 'x.png?', this, params);
        }
    };
}


function get3031() {
    var halfWidth = 12367396.2185; // To the Equator
    var extent = [-halfWidth, -halfWidth, halfWidth, halfWidth];
    ol.proj.get('EPSG:3031').setExtent(extent);
    var resolutions = Array.from(new Array(maxZoom + 1), function(x, i) {
        return halfWidth / (tileSize * Math.pow(2, i - 1));
    });

    var tileGrid16 = new ol.tilegrid.TileGrid({
        extent: extent,
        origin: [-halfWidth, halfWidth],
        minZoom: 0,
        maxZoom: maxZoom,
        resolutions: resolutions,
        tileSize: tileSize
    });

    var getCenter = function() {
        return ol.proj.fromLonLat([0, -89], 'EPSG:3031');
    };

    return {
        name: 'EPSG_3031',
        wrapX: false,
        srs: 'EPSG:3031',
        projection: 'EPSG:3031',
        epsg: 3031,
        tileGrid: tileGrid16,
        resolutions: resolutions,
        fitExtent: extent,
        getView: function(lat, lon, zoom) {
            return new ol.View({
                center: getCenter(lat, lon),
                projection: ol.proj.get('EPSG:3031'),
                zoom: zoom || 0,
                maxResolution: halfWidth / tileSize * 2
            });
        },
        getBaseLayer: function(params) {
            return getLayer(baseMaps.EPSG_3031.url, this, params);
        },
        getOccurrenceLayer: function(params) {
            return getLayer(env.dataApiV2 + 'map/occurrence/density/{z}/{x}/{y}@' + pixelRatio + 'x.png?', this, params);
        }
    };
}


function getLayer(baseUrl, proj, params) {
    params = params || {};
    params.srs = proj.srs;
    var progress = params.progress;
    delete params.progress;
    var source = new ol.source.TileImage({
        projection: proj.projection,
        tileGrid: proj.tileGrid,
        tilePixelRatio: pixelRatio,
        url: baseUrl + querystring.stringify(params),
        wrapX: proj.wrapX
    });
    if (progress) {
        source.on('tileloadstart', function() {
            progress.addLoading();
        });

        source.on('tileloadend', function() {
            progress.addLoaded();
        });
        source.on('tileloaderror', function() {
            progress.addLoaded();
        });
    }

    return new ol.layer.Tile({
        extent: proj.extent,
        source: source,
        useInterimTilesOnError: false,
        visible: true
    });
}


// currently map resolution isn't too good.
// it is neccessary to hardcode resolution to zoom levels
/*
0: 32
1: 64
2: 128
3: 256
4: 128
5: 256
6: 512
7: 1024
8: 256
9: 512
10: 1042
11: 2048
12: 1024
13: 2048
14: 4096
*/
function getAdhocLayer(baseUrl, proj, params) {
    params = params || {};
    params.srs = proj.srs;
    var progress = params.progress;
    delete params.progress;
    var source = new ol.source.XYZ({
        projection: proj.projection,
        tileGrid: proj.tileGrid,
        tilePixelRatio: pixelRatio,
        xurl: baseUrl + querystring.stringify(params),
        tileUrlFunction: function(tileCoord, pixelRatio, proj) {
            var squareSizePerZoomLevel = [
                256, // 32 none of the styles provided by the API looks good in this resolution,
                256, // 64 none of the styles provided by the API looks good in this resolution,
                256, // 128 none of the styles provided by the API looks good in this resolution,
                256,
                256, // 128 none of the styles provided by the API looks good in this resolution,
                256,
                512,
                1024,
                256,
                512,
                1042,
                2048,
                1024,
                2048,
                4096
            ];
            var z = tileCoord[0].toString();
            var x = tileCoord[1].toString();
            // for reasons unknown y is negative https://stackoverflow.com/questions/38730404/in-openlayers-3-why-are-the-tms-y-coordinates-negative
            var y = ( -tileCoord[2] - 1).toString();

            params.squareSize = squareSizePerZoomLevel[z] || 32;
            var str = baseUrl + querystring.stringify(params);

            str = str.replace('{z}', z);
            str = str.replace('{x}', x);
            str = str.replace('{y}', y);
            return str;
        },
        wrapX: proj.wrapX
    });
    if (progress) {
        source.on('tileloadstart', function() {
            progress.addLoading();
        });

        source.on('tileloadend', function() {
            progress.addLoaded();
        });
        source.on('tileloaderror', function() {
            progress.addLoaded();
        });
    }

    return new ol.layer.Tile({
        extent: proj.extent,
        source: source,
        useInterimTilesOnError: false,
        visible: true
    });
}

module.exports = {
    EPSG_4326: get4326(),
    EPSG_3575: get3575(),
    EPSG_3031: get3031(),
    EPSG_3857: get3857()
};
