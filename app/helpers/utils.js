'use strict';
let ranks = require('./constants').allRanks;
let maxmind = require('maxmind');
let cityLookup = maxmind.openSync(__dirname + '/GeoLite2-Country.mmdb');
let _ = require('lodash');

function getGeoIp(ip) {
    if (_.isString(ip)) {
        return cityLookup.get(ip);
    } else {
        return undefined;
    }
}

function isGuid(stringToTest) {
    let regexGuid = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/gi;
    return regexGuid.test(stringToTest);
}

function renderPage(req, res, next, template, data) {
    try {
        if (req.params.ext == 'debug') {
            res.json(data);
        } else {
            res.render(template, data);
        }
    } catch (e) {
        next(e);
    }
}

/**
 * Returns an integer based ordering of all known ranks that can be used in lodash sortBy
 * @param rank as string based on the GBIF Rank enumeration
 */
function rankOrder(rank) {
    let idx = -1;
    if (rank) {
        idx = _.indexOf(ranks, rank.toLowerCase());
    }
    return idx < 0 ? 9999 : idx;
}

/**
 * Sorts name usages, i.e. taxon objects by their rank then by their alphanumerical ordering of the scientific name.
 * @param taxa list of taxon objects with scientificName and tank property
 * @return {Array}
 */
function sortByRankThenAlpha(taxa) {
    return _.sortBy(taxa, [
        function(t) {
            return rankOrder(t.rank);
        },
        function(t) {
            return t.scientificName;
        }
    ]);
}

module.exports = {
    sortByRankThenAlpha: sortByRankThenAlpha,
    rankOrder: rankOrder,
    isGuid: isGuid,
    renderPage: renderPage,
    getGeoIp: getGeoIp
};
