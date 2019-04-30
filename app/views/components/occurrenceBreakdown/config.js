var BAR = 'BAR';
var COLUMN = 'COLUMN';
var TABLE = 'TABLE';
var PIE = 'PIE';
var LINE = 'LINE';

var enums = {
    type: {
        BAR: BAR,
        COLUMN: COLUMN,
        PIE: PIE,
        LINE: LINE,
        TABLE: TABLE
    }
};

var config = {
    dimensions: ['institutionCode', 'basisOfRecord', 'country', 'kingdomKey', 'speciesKey', 'decimalLatitude', 'publishingCountry', 'issue', 'datasetKey', 'month', 'year', 'elevation', 'publishingOrg', 'license'],
    secondaryDimensions: ['basisOfRecord', 'country', 'publishingCountry', 'issue', 'month', 'decimalLatitude', 'year', 'elevation', 'kingdomKey', 'license'],
    chartTypes: [COLUMN, PIE, TABLE, LINE],
    printableTypes: [LINE, COLUMN, PIE],
    getDimensionParams: function(first, second) {
        var params = {
            dimension: first,
            secondDimension: second,
            buckets: undefined
        };

        // first param
        if (first === 'decimalLatitude' || first === 'elevation') {
            params.buckets = 10;
        } else if (first === 'month') {
            params.limit = 12;
            params.fillEnums = true;
        } else if (first === 'basisOfRecord') {
            params.fillEnums = true;
        } else if (first === 'year') {
            if (!second) {
                params.limit = 1000;
            }
        }
        return params;
    },
    enum: enums
};

if (Object.freeze) {
    Object.freeze(config);
}
module.exports = config;
