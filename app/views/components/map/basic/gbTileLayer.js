L.Icon.Default.imagePath = '/img';


// GBIF leaflet layer. For other projections than 4326 use leaflet 0.7.
L.GBIFSimple = L.TileLayer.extend({

    options: {
        tileSize: 256,
        attribution: 'GBIF.org',
        errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'// empty tile
    },

    defaultGBIFParams: {
        style: 'classic',
        srs: 'EPSG:4326'
    },

    initialize: function(url, options) {
        this._url = url;

        // all keys that are not TileLayer options go to GBIF params
        var gbifParams = L.extend({}, this.defaultGBIFParams);
        for (var i in options) {
            if (!(i in this.options)) {
                gbifParams[i] = options[i];
            }
        }

        options = L.setOptions(this, options);
        this.gbifParams = gbifParams;
    },

    getTileUrl: function(coords) {
        var url = L.TileLayer.prototype.getTileUrl.call(this, coords);
        return url + L.Util.getParamString(this.gbifParams, url);
    }
});

L.gbifSimpleLayer = function(url, options) {
    return new L.GBIFSimple(url, options);
};


// https://gist.github.com/rclark/5779673/ MIT license
// TopoJspn is smaller then geojson. This leaflet extension allows working with topoJson in Leaflet
// var topojson = require('topojson');
// L.TopoJSON = L.GeoJSON.extend({
//   addData: function(jsonData) {
//     if (jsonData.type === "Topology") {
//       for (key in jsonData.objects) {
//         geojson = topojson.feature(jsonData, jsonData.objects[key]);
//         L.GeoJSON.prototype.addData.call(this, geojson);
//       }
//     }
//     else {
//       L.GeoJSON.prototype.addData.call(this, jsonData);
//     }
//   }
// });

module.exports = undefined;
