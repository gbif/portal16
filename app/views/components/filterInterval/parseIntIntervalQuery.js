'use strict';
var parseIntervalQuery = require('./parseIntervalQuery');

module.exports = function(q) {
    var interval = parseIntervalQuery(q);
    if (!interval) {
        return invalidResponse();
    }
    if (interval.values[0] && !isNumber(interval.values[0])) {
        return invalidResponse();
    }
    if (interval.values[1] && !isNumber(interval.values[1])) {
        return invalidResponse();
    }
    return interval;
};

function isNumber(num) {
    var reg = /^\d+$/;
    return reg.test(num);
}

function invalidResponse() {
    return {
        type: 'invalid'
    };
}
