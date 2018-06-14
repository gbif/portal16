var _ = require('lodash');

module.exports = {
    defaults: {
        basemap: 1,
        bin: 1,
        color: 8
    },
    supportedMapLocales: _.keyBy(['ar', 'da', 'de', 'en', 'es', 'fr', 'ja', 'pt', 'ru', 'zh']),
    localizedStyles: _.keyBy(['gbif-geyser', 'gbif-tuatara', 'osm-bright']),
    basemaps: [
        {
            name: 'CLASSIC',
            query: {style: 'gbif-classic'}
        },
        {
            name: 'LIGHT',
            query: {style: 'gbif-light'}
        },
        {
            name: 'LIGHT_DETAILS',
            query: {style: 'gbif-geyser'}
        },
        {
            name: 'DARK',
            query: {style: 'gbif-dark'}
        },
        {
            name: 'DARK_DETAILS',
            query: {style: 'gbif-tuatara'}
        },
        {
            name: 'OSM',
            query: {style: 'osm-bright'}
        }
    ],
    binning: [
        {
            name: 'PIXEL',
            query: {},
            type: 'POINT'
        },
        {
            name: 'SMALL_HEX',
            query: {bin: 'hex', hexPerTile: 79},
            type: 'POLY'
        },
        {
            name: 'LARGE_HEX',
            query: {bin: 'hex', hexPerTile: 17},
            type: 'POLY'
        },
        {
            name: 'SMALL_SQUARE',
            query: {bin: 'square', squareSize: 64},
            type: 'POLY'
        },
        {
            name: 'LARGE_SQUARE',
            query: {bin: 'square', squareSize: 256},
            type: 'POLY'
        }
    ],
    colors: [
        {
            name: 'CLASSIC',
            query: ['classic.point'],
            type: 'POINT'
        },
        {
            name: 'PURPLE_YELLOW',
            query: ['purpleYellow.point'],
            type: 'POINT'
        },
        {
            name: 'PURPLE_HEAT',
            query: ['purpleHeat.point'],
            type: 'POINT'
        },
        {
            name: 'BLUE_HEAT',
            query: ['blueHeat.point'],
            type: 'POINT'
        },
        {
            name: 'ORANGE_HEAT',
            query: ['orangeHeat.point'],
            type: 'POINT'
        },
        {
            name: 'FIRE',
            query: ['fire.point'],
            type: 'POINT'
        },
        {
            name: 'GLACIER',
            query: ['glacier.point'],
            type: 'POINT'
        },
        {
            name: 'CLASSIC',
            query: ['classic.poly'],
            type: 'POLY'
        },
        {
            name: 'PURPLE_YELLOW',
            query: ['purpleYellow.poly'],
            type: 'POLY'
        },
        {
            name: 'GREEN',
            query: ['green2.poly'],
            type: 'POLY'
        },
        {
            name: 'BLUE_CLUSTER',
            query: ['outline.poly', 'blue.marker'],
            type: 'POLY'
        },
        {
            name: 'ORANGE_CLUSTER',
            query: ['outline.poly', 'orange.marker'],
            type: 'POLY'
        }
    ],
    predefined: {
        CLASSIC: {
            baseMap: {style: 'gbif-classic'},
            overlay: []
        },
        CLASSIC_HEX: {
            baseMap: {style: 'gbif-classic'},
            overlay: [{style: 'classic.poly', bin: 'hex', hexPerTile: 70}]
        },
        STREETS: {
            baseMap: {style: 'osm-bright'},
            localized: true,
            overlay: [{style: 'outline.poly', bin: 'hex', hexPerTile: 15}, {
                style: 'orange.marker',
                bin: 'hex',
                hexPerTile: 15
            }]
        },
        GLACIER: {
            baseMap: {style: 'gbif-tuatara'},
            localized: true,
            overlay: [{style: 'glacier.point'}]
        }
    }
};
