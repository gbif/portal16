var apirequest = require('./api-request'),
    confidenceThreshold = 20;

function getMatchesByConfidence(results) {
    var alternative,
        confidentMatches = [];

    if (results && results.confidence > confidenceThreshold && results.matchType == 'EXACT') {
        delete results.alternatives;
        confidentMatches.push(results);
    } else if (results && results.alternatives) {
        for (var i = 0; i < results.alternatives.length; i++) {
            alternative = results.alternatives[i];
            if (alternative.confidence > confidenceThreshold) {
                confidentMatches.push(alternative);
            } else {
                break;
            }
        }
    }
    return confidentMatches;
}

function filterByMatchType(matches) {
    var requiredMatchType;
    if (matches.length < 2) {
        return matches;
    }
    requiredMatchType = matches[0].matchType;
    return matches.filter(function (e) {
        return e.matchType == requiredMatchType;
    })
}

function filterByExactQuery(matches, query) {
    var match, i, len = matches.length;
    for (i = 0; i < len; i++) {
        match = matches[i];
        if (match.scientificName !== match.canonicalName && match.scientificName === query) {
            return [match]
        }
    }
    return matches;
}

function getSynonymKey(species) {
    if (!species.synonym) {
        return false
    }
    var taxonKeyMap = {
        KINGDOM: 'kingdomKey',
        PHYLUM: 'phylumKey',
        CLASS: 'classKey',
        ORDER: 'orderKey',
        FAMILY: 'familyKey',
        GENUS: 'genusKey',
        SPECIES: 'speciesKey'
    };
    return species[taxonKeyMap[species.rank]];
}

function getHigestRankingLowerClasses(children) {
    if (children.results.length < 2) {
        return children;
    }
    var requiredRank = children.results[0].rank;
    children.results = children.results.filter(function (e) {
        return e.rank == requiredRank;
    });
    return children;
}

function renderPage(req, res, next, data, template) {
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

module.exports = {
    getApiData: apirequest.getApiData,
    getApiDataPromise: apirequest.getApiDataPromise,
    getMatchesByConfidence: getMatchesByConfidence,
    filterByMatchType: filterByMatchType,
    getSynonymKey: getSynonymKey,
    getHigestRankingLowerClasses: getHigestRankingLowerClasses,
    filterByExactQuery: filterByExactQuery,
    renderPage: renderPage
};