L.Icon.Default.imagePath = '/img';

L.GBIFSimple = L.TileLayer.extend({

    options: {
        tileSize: 256,
        attribution: 'GBIF.org',
        errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'// empty tile
    },

    defaultGBIFParams: {
        style: "classic",
        srs: "EPSG:4326",
    },

    initialize: function (url, options) {
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

    getTileUrl: function (coords) {
        var url = L.TileLayer.prototype.getTileUrl.call(this, coords);
        return url + L.Util.getParamString(this.gbifParams, url)
    }
});

L.gbifSimpleLayer = function (url, options) {
    return new L.GBIFSimple(url, options);
};

module.exports = undefined;