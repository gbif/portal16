'use strict';

var config = require('./config');

module.exports = {
    serialize: serialize,
    deserialize: deserialize
};

function serialize(dimension, type, limit, offset, buckets) {
    var d = config.dimensions.indexOf(dimension);
    var t = config.chartTypes.indexOf(type);
    var str = d + ':' + t + ':' + buckets;
    if (limit !== 0) {
        str += ':' + limit;
    }
    if (offset !== 0) {
        str += ':' + offset;
    }
    return str;
}

function deserialize(str) {
    var parts = str.split(':');
    var dimension = config.dimensions[parts[0]];
    var type = config.chartTypes[parts[1]];
    return {
        dimension: dimension,
        type: type,
        limit: parts[3] || 0,
        offset: parts[4] || 0,
        buckets: parts[2]
    };
}
