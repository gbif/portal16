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
    dimensions: ['basisOfRecord', 'country', 'taxonKey', 'decimalLatitude', 'issue', 'datasetKey', 'month', 'year', 'elevation'],
    chartTypes: [BAR, COLUMN, PIE, TABLE],
    printableTypes: [BAR, COLUMN, PIE],
    supportedTypes: {
        basisOfRecord: [BAR, COLUMN, PIE, TABLE],
        month: [COLUMN, PIE],
        country: [TABLE],
        taxonKey: [TABLE],
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
        }
    },
    enum: enums
};

if (Object.freeze) {
    Object.freeze(config);
}
module.exports = config;
