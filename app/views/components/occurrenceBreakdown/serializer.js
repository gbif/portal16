'use strict';

// var config = require('./config');

module.exports = {
    serialize: serialize,
    deserialize: deserialize
};

function serialize(dimension, secondDimension, type) {
    var d = dimension;// config.dimensions.indexOf(dimension);
    var d2 = secondDimension;// config.secondaryDimensions.indexOf(secondDimension);
    var t = type;// config.chartTypes.indexOf(type);
    var str = d + ':' + t;
    if (d2) {
        str += ':' + d2;
    }
    return str;
}

function deserialize(str) {
    var parts = str.split(':');
    // var dimension = config.dimensions[parts[0]];
    var dimension = parts[0];
    // var secondDimension = config.dimensions[parts[1]];
    var secondDimension = parts[2];
    // var type = config.chartTypes[parts[2]];
    var type = parts[1];
    return {
        dimension: dimension,
        secondDimension: secondDimension,
        type: type
    };
}
