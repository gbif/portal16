var pixel_ratio = parseInt(window.devicePixelRatio) || 1;

module.exports = {
  "EPSG_4326": {
    "name": "PLATE_CAREE",
    "url": "//tile.gbif.org/4326/omt/{z}/{x}/{y}@" + pixel_ratio + "x.png?",
    "srs": "EPSG:4326"
  },
  "EPSG_3857": {
    "name": "MERCATOR",
    "url": "//tile.gbif.org/3857/omt/{z}/{x}/{y}@" + pixel_ratio + "x.png?",
    "srs": "EPSG:3857"
  },
  "EPSG_3575": {
    "name": "ARCTIC",
    "url": "//tile.gbif.org/3575/omt/{z}/{x}/{y}@" + pixel_ratio + "x.png?",
    "srs": "EPSG:3575"
  },
  "EPSG_3031": {
    "name": "ANTARCTIC",
    "url": "//tile.gbif.org/3031/omt/{z}/{x}/{y}@" + pixel_ratio + "x.png?",
    "srs": "EPSG:3031"
  }
}