'use strict';
var pixel_ratio = parseInt(window.devicePixelRatio) || 1;
var env = window.gb.env;

module.exports = {
  "EPSG_4326": {
    "name": "PLATE_CAREE",
    "url": env.basemapTileApi + "/4326/omt/{z}/{x}/{y}@" + pixel_ratio + "x.png?",
    "srs": "EPSG:4326"
  },
  "EPSG_3857": {
    "name": "MERCATOR",
    "url": env.basemapTileApi + "/3857/omt/{z}/{x}/{y}@" + pixel_ratio + "x.png?",
    "srs": "EPSG:3857"
  },
  "EPSG_3575": {
    "name": "ARCTIC",
    "url": env.basemapTileApi + "/3575/omt/{z}/{x}/{y}@" + pixel_ratio + "x.png?",
    "srs": "EPSG:3575"
  },
  "EPSG_3031": {
    "name": "ANTARCTIC",
    "url": env.basemapTileApi + "/3031/omt/{z}/{x}/{y}@" + pixel_ratio + "x.png?",
    "srs": "EPSG:3031"
  }
};