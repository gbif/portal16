'use strict';

var Utilities = function () {
};

Utilities.queryTransform = function (query) {
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

Utilities.literatureUrl = function (results) {
    results.forEach(result => {
        if (result.type === 'literature') {
            if (result.literatureIdentifiers && result.literatureIdentifiers.hasOwnProperty('doi')) {
                result.literatureUrl = 'https://doi.org/' + result.literatureIdentifiers.doi;
            }
            else if (result.literatureWebsites && result.literatureWebsites.length > 0) {
                result.literatureUrl = result.literatureWebsites[0];
            }
        }
    });
};

module.exports = Utilities;