"use strict";
var parseIntervalQuery = require('../filterInterval/parseIntervalQuery'),
    reg = /^\d{1,4}\-((0[1-9])|1[0-2])$/;
module.exports = function (q) {
    var interval = parseIntervalQuery(q);
    if (!interval) {
        return invalidResponse();
    }

    if (!isDate(interval.values[0])) {
        return invalidResponse();
    } else {
        interval.values[0] = parseDate(interval.values[0]);
    }

    if (!isDate(interval.values[1])) {
        return invalidResponse();
    } else {
        interval.values[1] = parseDate(interval.values[1]);
    }
    return interval;
};

function parseDate(str) {
    var parts = str.split('-');
    return {
        year: parseInt(parts[0]),
        month: parseInt(parts[1])
    };
}

function isDate(num) {
    if (!num) {
        return false;
    } else {
        return reg.test(num);
    }
}

function invalidResponse(){
    return {
        type: 'invalid'
    }
}