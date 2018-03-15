var BAR = 'BAR';
var COLUMN = 'COLUMN';
var TABLE = 'TABLE';
var PIE = 'PIE';

var enums = {
    type: {
        BAR: BAR,
        COLUMN: COLUMN,
        PIE: PIE,
        TABLE: TABLE
    }
};

var config = {
    dimensions: ['basisOfRecord', 'country', 'kingdomKey', 'speciesKey', 'decimalLatitude', 'issue', 'datasetKey', 'month', 'year', 'elevation'],
    secondaryDimensions: ['basisOfRecord', 'country', 'issue', 'month', 'decimalLatitude', 'year', 'elevation'],
    chartTypes: [BAR, COLUMN, PIE, TABLE],
    printableTypes: [BAR, COLUMN, PIE],
    supportedTypes: {
        basisOfRecord: [BAR, COLUMN, PIE, TABLE],
        month: [COLUMN, PIE],
        country: [TABLE],
        kingdomKey: [TABLE],
        speciesKey: [TABLE],
        decimalLatitude: [BAR],
        issue: [BAR, COLUMN, PIE, TABLE],
        datasetKey: [BAR, TABLE],
        year: [COLUMN, TABLE],
        elevation: [BAR, TABLE]
    },
    dimensionParams: {
        decimalLatitude: {
            buckets: 10
        },
        elevation: {
            buckets: 10
        },
        month: {
            limit: 12,
            fillEnums: true
        },
        year: {
        },
        basisOfRecord: {
            fillEnums: false
        }
    },
    enum: enums
};

if (Object.freeze) {
    Object.freeze(config);
}
module.exports = config;
