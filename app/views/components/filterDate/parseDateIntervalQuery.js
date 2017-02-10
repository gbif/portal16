"use strict";
var parseIntervalQuery = require('../filterInterval/parseIntervalQuery'),
    reg = /^\d{1,4}\-((0?[1-9])|1[0-2])$/;
module.exports = function (q) {
    var interval = parseIntervalQuery(q);
    if (!interval) {
        return invalidResponse();
    }

    if (interval.type === 'between' || interval.type === 'greaterThanOrEquals' || interval.type === 'is') {
        if (!isDate(interval.values[0])) {
            return invalidResponse();
        } else {
            interval.from = parseDate(interval.values[0]);
        }
    }
    if (interval.type === 'between' || interval.type === 'lessThanOrEquals') {
        if (!isDate(interval.values[1])) {
            return invalidResponse();
        } else {
            interval.to = parseDate(interval.values[1]);
        }
    }
    return interval;
};

function parseDate(str) {
    var parts = str.split('-');
    return {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]).toString()
    };
}

function isDate(num) {
    return reg.test(num);
}

function invalidResponse(){
    return {
        type: 'invalid'
    }
}
