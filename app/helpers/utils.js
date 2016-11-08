"use strict";

var ranks = require('./constants').allRanks,
        _ = require('lodash');

function isGuid(stringToTest) {
    var regexGuid = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/gi;
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
    var idx = -1;
    if (rank) {
        idx = _.indexOf(ranks, rank.toLowerCase());
    }
    return idx < 0 ? 9999 : idx;
}

/**
 * Sorts name usages, i.e. taxon objects by their rank then by their alphanumerical ordering of the scientific name.
 * @param taxa list of taxon objects with scientificName and tank property
 * @returns {Array}
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

//var t2 = [
//    {"key":194,"nameKey":8767134,"canonicalName":"Pinopsida","scientificName":"Pinopsida","rank":"CLASS","numDescendants":3141,"numOccurrences":187},
//    {"key":196,"nameKey":6318906,"canonicalName":"Liliopsida","scientificName":"Liliopsida","rank":"CLASS","numDescendants":118758,"numOccurrences":11677},
//    {"key":220,"nameKey":6628031,"canonicalName":"Magnoliopsida","scientificName":"Magnoliopsida","rank":"CLASS","numDescendants":489058,"numOccurrences":58895},
//    {"key":228,"nameKey":3142255,"canonicalName":"Cycadopsida","scientificName":"Cycadopsida","rank":"CLASS","numDescendants":935,"numOccurrences":8},
//    {"key":244,"nameKey":4696760,"canonicalName":"Ginkgoopsida","scientificName":"Ginkgoopsida","rank":"CLASS","numDescendants":127,"numOccurrences":4},
//    {"key":245,"nameKey":6531905,"canonicalName":"Lycopodiopsida","scientificName":"Lycopodiopsida","rank":"CLASS","numDescendants":2199,"numOccurrences":1390},
//    {"key":246,"nameKey":4058392,"canonicalName":"Equisetopsida","scientificName":"Equisetopsida","rank":"CLASS","numDescendants":464,"numOccurrences":57},
//    {"key":282,"nameKey":4760512,"canonicalName":"Gnetopsida","scientificName":"Gnetopsida","rank":"CLASS","numDescendants":401,"numOccurrences":18},
//    {"key":7219203,"nameKey":9443828,"canonicalName":"Psilotopsida","scientificName":"Psilotopsida","rank":"CLASS","numDescendants":388,"numOccurrences":28},
//    {"key":7228679,"nameKey":9443828,"canonicalName":"Psilotopsida","scientificName":"Psilotopsida","rank":"CLASS","numDescendants":658,"numOccurrences":50},
//    {"key":7228682,"nameKey":6688401,"canonicalName":"Marattiopsida","scientificName":"Marattiopsida","rank":"CLASS","numDescendants":289,"numOccurrences":61},
//    {"key":7228684,"nameKey":9046929,"canonicalName":"Polypodiopsida","scientificName":"Polypodiopsida","rank":"CLASS","numDescendants":21539,"numOccurrences":15567}
//];
//
//console.log(sortByRankThenAlpha(t2));

module.exports = {
    sortByRankThenAlpha: sortByRankThenAlpha,
    rankOrder: rankOrder,
    isGuid: isGuid,
    renderPage: renderPage
};
