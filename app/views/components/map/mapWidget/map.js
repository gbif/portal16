'use strict';

var ol = require('openlayers'),
    proj4 = require('proj4');
ol.proj.setProj4(proj4);

module.exports = {
    createMap: createMap,
    createMap2: createMap2
    //create
    //updateOverlay
    //changeBaseMap
    //set center
    //set bounds
    //set zoom
    //registerEvent
    //getBounds
    //addGeoJson
    //removeGeoJson
    //changeProjection
    //getProjection?
};

function createMap(element) {
    var mapElement = element[0].querySelector('.mapWidget__mapArea');

    proj4.defs('EPSG:4326', "+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees");
    var pixel_ratio = parseInt(window.devicePixelRatio) || 1;
    var extent = 180.0;
    var tile_size = 512;
    var max_zoom = 16;
    var resolutions = Array(max_zoom+1).fill().map((_, i) => ( extent / tile_size / Math.pow(2, i) ));
    var raster_style = 'gbif-middle';

    var tile_grid_14 = new ol.tilegrid.TileGrid({
        extent: ol.proj.get('EPSG:4326').getExtent(),
        minZoom: 0,
        maxZoom: 14,
        resolutions: resolutions,
        tileSize: tile_size
    });

    var tile_grid_16 = new ol.tilegrid.TileGrid({
        extent: ol.proj.get('EPSG:4326').getExtent(),
        minZoom: 0,
        maxZoom: 16,
        resolutions: resolutions,
        tileSize: tile_size
    });

    var layers = [];
    layers['EPSG:4326-R'] = new ol.layer.Tile({
        source: new ol.source.TileImage({
            projection: 'EPSG:4326',
            url: 'https://tile.gbif.org/4326/omt/{z}/{x}/{y}@'+pixel_ratio+'x.png?style='+raster_style,
            tileGrid: tile_grid_16,
            tilePixelRatio: 1,
            wrapX: true
        }),
        visible: true,
    });

    layers['EPSG:4326-R-CLASSIC'] = new ol.layer.Tile({
        source: new ol.source.TileImage({
            projection: 'EPSG:4326',
            url: 'https://tile.gbif.org/4326/omt/{z}/{x}/{y}@'+pixel_ratio+'x.png?style=gbif-classic',
            tileGrid: tile_grid_16,
            tilePixelRatio: 1,
            wrapX: true
        }),
        visible: true,
    });

    layers['OccurrenceDensity:4326'] = new ol.layer.VectorTile({
        renderMode: 'image',
        source: new ol.source.VectorTile({
            projection: 'EPSG:4326',
            format: new ol.format.MVT(),
            url: 'https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}.mvt?srs=EPSG:4326&bin=hex&taxonKey=2481433',
            tileGrid: tile_grid_14,
            tilePixelRatio: 8,
        }),
        //style: createDensityStyle(),
        visible: true,
    });

    layers['OccurrenceDensityRaster:4326'] = new ol.layer.Tile({
        extent: ol.proj.get('EPSG:4326').getExtent(),
        source: new ol.source.TileImage({
            projection: 'EPSG:4326',
            url: 'https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@'+pixel_ratio+'x.png?srs=EPSG:4326',
            tileGrid: tile_grid_16,
            tilePixelRatio: 1,
            wrapX: true
        }),
        visible: true
    });


    var map = new ol.Map({
        layers: [
            layers['EPSG:4326-R-CLASSIC'],
            layers['EPSG:4326-R'],
            //layers['OccurrenceDensity:4326']
            layers['OccurrenceDensityRaster:4326']
        ],
        target: mapElement,
        view: new ol.View({
            center: [0, 0],
            projection: 'EPSG:4326',
            zoom: 2
        })
    });

    this.restyle = function(){
        console.log('restyle');
        console.log(layers);
        var a=layers['OccurrenceDensityRaster:4326'];
        var b=a.getSource();
        b.setUrl('https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?srs=EPSG:4326');
    };

    this.projectionChange = function(){
        reproj(map, layers);
    };

    return {
        map: map,
        restyle: this.restyle,
        projectionChange: this.projectionChange
    };
}



function reproj(map, layers) {
    console.log('change projection');
    console.log(layers);
    proj4.defs("EPSG:3575", "+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs");

    var pixel_ratio = parseInt(window.devicePixelRatio) || 1;

    var halfWidth = Math.sqrt(2) * 6371007.2;
    var extent = [-halfWidth, -halfWidth, halfWidth, halfWidth];
    ol.proj.get("EPSG:3575").setExtent(extent);
    var tile_size = 512;
    var max_zoom = 16;
    var resolutions = Array.from(new Array(max_zoom+1), (x,i) => (halfWidth/(tile_size*Math.pow(2,i-1))));

    var tile_grid_14 = new ol.tilegrid.TileGrid({
        extent: extent,
        origin: [-halfWidth, halfWidth],
        minZoom: 0,
        maxZoom: 14,
        resolutions: resolutions,
        tileSize: tile_size
    });

    var tile_grid_16 = new ol.tilegrid.TileGrid({
        extent: extent,
        origin: [-halfWidth, halfWidth],
        minZoom: 0,
        maxZoom: max_zoom,
        resolutions: resolutions,
        tileSize: tile_size
    });

    var layers2 = [];

    var raster_style = 'gbif-middle';
    layers2['EPSG:3575-R'] = new ol.layer.Tile({
        extent: extent,
        source: new ol.source.TileImage({
            projection: 'EPSG:3575',
            tileGrid: tile_grid_14,
            url: 'https://tile.gbif.org/3575/omt/{z}/{x}/{y}@'+pixel_ratio+'x.png?style='+raster_style,
            tilePixelRatio: 1,
            wrapX: false
        }),
        visible: true,
    });
    layers2['OccurrenceDensityRaster:3575'] = new ol.layer.Tile({
        extent: extent,
        source: new ol.source.TileImage({
            projection: 'EPSG:3575',
            tileGrid: tile_grid_16,
            tilePixelRatio: 1,
            url: 'https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@'+pixel_ratio+'x.png?srs=EPSG:3575',
            wrapX: false
        }),
        visible: true
    });
    map.getLayers().clear();
    map.setView(new ol.View({
        //center: ol.proj.fromLonLat([-1.049565, 51.441297], 'EPSG:3575'),
        center: ol.proj.fromLonLat([0, 89], 'EPSG:3575'),
        projection: ol.proj.get('EPSG:3575'),
        zoom: 1,
        maxResolution: halfWidth / tile_size * 2
    }));
    map.addLayer(layers2['EPSG:3575-R']);
    map.addLayer(layers2['OccurrenceDensityRaster:3575']);
}









function createMap2(element) {
    var mapElement = element[0].querySelector('.mapWidget__mapArea');
    proj4.defs("EPSG:3575", "+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs");

    var pixel_ratio = parseInt(window.devicePixelRatio) || 1;

    var halfWidth = Math.sqrt(2) * 6371007.2;
    var extent = [-halfWidth, -halfWidth, halfWidth, halfWidth];
    ol.proj.get("EPSG:3575").setExtent(extent);
    var tile_size = 512;
    var max_zoom = 16;
    var resolutions = Array.from(new Array(max_zoom+1), (x,i) => (halfWidth/(tile_size*Math.pow(2,i-1))));

    var tile_grid_14 = new ol.tilegrid.TileGrid({
        extent: extent,
        origin: [-halfWidth, halfWidth],
        minZoom: 0,
        maxZoom: 14,
        resolutions: resolutions,
        tileSize: tile_size
    });

    var tile_grid_16 = new ol.tilegrid.TileGrid({
        extent: extent,
        origin: [-halfWidth, halfWidth],
        minZoom: 0,
        maxZoom: max_zoom,
        resolutions: resolutions,
        tileSize: tile_size
    });

    var layers = [];

    var raster_style = 'gbif-middle';
    layers['EPSG:3575-R'] = new ol.layer.Tile({
        extent: extent,
        source: new ol.source.TileImage({
            projection: 'EPSG:3575',
            tileGrid: tile_grid_14,
            url: 'https://tile.gbif.org/3575/omt/{z}/{x}/{y}@'+pixel_ratio+'x.png?style='+raster_style,
            tilePixelRatio: 1,
        }),
        visible: true
    });
    layers['OccurrenceDensityRaster:3575'] = new ol.layer.Tile({
        extent: extent,
        source: new ol.source.TileImage({
            projection: 'EPSG:3575',
            tileGrid: tile_grid_16,
            tilePixelRatio: 1,
            url: 'https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@'+pixel_ratio+'x.png?srs=EPSG:3575',
        }),
        visible: true
    });
    var map = new ol.Map({
        layers: [
            layers['EPSG:3575-R'],
            layers['OccurrenceDensityRaster:3575']
        ],
        target: mapElement,
        view: new ol.View({
            center: ol.proj.fromLonLat([-1.049565, 51.441297], 'EPSG:3575'),
            projection: ol.proj.get('EPSG:3575'),
            zoom: 1,
            maxResolution: halfWidth / tile_size * 2
        })
    });

    window.map = map;
    return {
        map: map
    };
}
