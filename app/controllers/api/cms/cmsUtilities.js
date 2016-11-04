'use strict';

var Utilities = function() {
};

Utilities.queryTransform = function(query) {
    if (query && query.hasOwnProperty('limit')) {
        query.range = query.limit;
        delete query.limit;
    }
    else {
        query.range = 20;
    }

    if (query && !query.hasOwnProperty('page')) {
        if (query && query.hasOwnProperty('offset')) {
            query.page = Math.floor(query.offset / query.range) + 1;
        }
        else {
            query.page = 1;
        }
    }

    return query;
};

module.exports = Utilities;