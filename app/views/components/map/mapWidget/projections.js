"use strict";

var ol = require('openlayers'),
    proj4 = require('proj4'),
    querystring = require('querystring'),
    baseMaps = require('./baseMapConfig');

ol.proj.setProj4(proj4);

proj4.defs('EPSG:4326', "+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees");
proj4.defs("EPSG:3575", "+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs");
proj4.defs("EPSG:3031", "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs");

//set up projections an dshared variables
var halfWidth = Math.sqrt(2) * 6371007.2;
var tile_size = 512;
var max_zoom = 14;

function get4326() {
    var extent = 180.0;
    var resolutions = Array(max_zoom + 1).fill().map(function (_, i) {
        return extent / tile_size / Math.pow(2, i)
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
        //tile_grid_14: tile_grid_14,
        tileGrid: tile_grid_16,
        resolutions: resolutions,
        fitExtent: [-1, -80, 1, 80],
        getView: function (lat, lon, zoom) {
            lat = lat || 0;
            lon = lon || 0;
            zoom = zoom || 0;
            return new ol.View({
                maxZoom: max_zoom,
                minZoom: 0,
                center: [lon, lat],
                zoom: zoom,
                projection: 'EPSG:4326'
            })
        },
        getBaseLayer: function (params) {
            return getLayer(baseMaps.EPSG_4326.url, this, params);
        },
        getOccurrenceLayer: function (params) {
            return getLayer('https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?', this, params);
        }
    };
}


function get3857() {
    var tile_grid_16 = ol.tilegrid.createXYZ({
        minZoom: 0,
        maxZoom: max_zoom,
        tileSize: tile_size
    });
    return {
        name: 'EPSG_3857',
        wrapX: true,
        srs: 'EPSG:3857',
        //projection: 'EPSG:3857',
        epsg: 3857,
        tileGrid: tile_grid_16,
        //resolutions: resolutions,
        fitExtent: ol.proj.transformExtent([-90, -75, 90, 75], 'EPSG:4326', 'EPSG:3857'),
        getView: function (lat, lon, zoom) {
            lat = lat || 0;
            lon = lon || 0;
            zoom = zoom || 0;
            return new ol.View({
                maxZoom: max_zoom,
                minZoom: 0,
                center: [lon, lat],
                zoom: zoom,
                projection: 'EPSG:3857'
            })
        },
        getBaseLayer: function (params) {
            return getLayer(baseMaps.EPSG_3857.url, this, params);
        },
        getOccurrenceLayer: function (params) {
            return getLayer('https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?', this, params);
        }
    };
}

function get3575() {
    var extent = [-halfWidth, -halfWidth, halfWidth, halfWidth];
    ol.proj.get("EPSG:3575").setExtent(extent);
    var resolutions = Array.from(new Array(max_zoom + 1), function (x, i) {
        return halfWidth / (tile_size * Math.pow(2, i - 1));
    });

    var tile_grid_16 = new ol.tilegrid.TileGrid({
        extent: extent,
        origin: [-halfWidth, halfWidth],
        minZoom: 0,
        maxZoom: max_zoom,
        resolutions: resolutions,
        tileSize: tile_size
    });

    var getCenter = function () {
        return ol.proj.fromLonLat([0, 89], 'EPSG:3575');
    };

    return {
        name: 'EPSG_3575',
        wrapX: false,
        srs: 'EPSG:3575',
        projection: 'EPSG:3575',
        epsg: 3575,
        //tile_grid_14: tile_grid_14,
        tileGrid: tile_grid_16,
        resolutions: resolutions,
        fitExtent: extent,
        getView: function (lat, lon, zoom) {
            return new ol.View({
                center: getCenter(lat, lon),
                projection: ol.proj.get('EPSG:3575'),
                zoom: zoom || 0,
                maxResolution: halfWidth / tile_size * 2
            })
        },
        getBaseLayer: function (params) {
            return getLayer(baseMaps.EPSG_3575.url, this, params);
        },
        getOccurrenceLayer: function (params) {
            return getLayer('https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?', this, params);
        }
    };
}


function get3031() {
    var halfWidth = 12367396.2185; // To the Equator
    var extent = [-halfWidth, -halfWidth, halfWidth, halfWidth];
    ol.proj.get("EPSG:3031").setExtent(extent);
    var resolutions = Array.from(new Array(max_zoom + 1), function (x, i) {
        return halfWidth / (tile_size * Math.pow(2, i - 1));
    });

    var tile_grid_16 = new ol.tilegrid.TileGrid({
        extent: extent,
        origin: [-halfWidth, halfWidth],
        minZoom: 0,
        maxZoom: max_zoom,
        resolutions: resolutions,
        tileSize: tile_size
    });

    var getCenter = function () {
        return ol.proj.fromLonLat([0, -89], 'EPSG:3031');
    };

    return {
        name: 'EPSG_3031',
        wrapX: false,
        srs: 'EPSG:3031',
        projection: 'EPSG:3031',
        epsg: 3031,
        tileGrid: tile_grid_16,
        resolutions: resolutions,
        fitExtent: extent,
        getView: function (lat, lon, zoom) {
            return new ol.View({
                center: getCenter(lat, lon),
                projection: ol.proj.get('EPSG:3031'),
                zoom: zoom || 0,
                maxResolution: halfWidth / tile_size * 2
            })
        },
        getBaseLayer: function (params) {
            return getLayer(baseMaps.EPSG_3031.url, this, params);
        },
        getOccurrenceLayer: function (params) {
            return getLayer('https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?', this, params);
        }
    };
}


function getLayer(baseUrl, proj, params) {
    params = params || {};
    params.srs = proj.srs;
    var progress = params.progress;
    console.log(progress);
    var source = new ol.source.TileImage({
        projection: proj.projection,
        tileGrid: proj.tileGrid,
        tilePixelRatio: 1,
        url: baseUrl + querystring.stringify(params),
        wrapX: proj.wrapX
    });
    source.on('tileloadstart', function() {
        progress.addLoading();
        console.log('tileloadstart');
    });

    source.on('tileloadend', function() {
        progress.addLoaded();
        console.log('tileloadend');
    });
    source.on('tileloaderror', function() {
        progress.addLoaded();
        console.log('tileloaderror');
    });

    return new ol.layer.Tile({
        extent: proj.extent,
        source: source,
        useInterimTilesOnError:false,
        visible: true
    });
}

module.exports = {
    EPSG_4326: get4326(),
    EPSG_3575: get3575(),
    EPSG_3031: get3031(),
    EPSG_3857: get3857()
};