"use strict";
var _ = require('lodash');

function composeGeoCoverage(dataset) {
    let geographicCoverages = _.get(dataset, 'record.geographicCoverages');
    if (_.isEmpty(geographicCoverages)) {
        return dataset;
    }
    
    return dataset;
}

module.exports = composeGeoCoverage;