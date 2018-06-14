let apirequest = require('./api-request'),
    config = require('../../../config/config'),
    imageCachePrefix = require('../gbifdata/apiConfig').image.url,
    clientTileApi = require('../gbifdata/apiConfig').clientTileApi.url,
    confidenceThreshold = 20;

function getMatchesByConfidence(results) {
    let alternative,
        confidentMatches = [];

    if (results && results.confidence > confidenceThreshold && results.matchType == 'EXACT') {
        delete results.alternatives;
        confidentMatches.push(results);
    } else if (results && results.alternatives) {
        for (let i = 0; i < results.alternatives.length; i++) {
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
    let requiredMatchType;
    if (matches.length < 2) {
        return matches;
    }
    requiredMatchType = matches[0].matchType;
    return matches.filter(function(e) {
        return e.matchType == requiredMatchType;
    });
}

function filterByExactQuery(matches, query) {
    let match, i, len = matches.length;
    for (i = 0; i < len; i++) {
        match = matches[i];
        if (match.scientificName !== match.canonicalName && match.scientificName === query) {
            return [match];
        }
    }
    return matches;
}

function getSynonymKey(species) {
    if (!species.synonym) {
        return false;
    }
    let taxonKeyMap = {
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
    let requiredRank = children.results[0].rank;
    children.results = children.results.filter(function(e) {
        return e.rank == requiredRank;
    });
    return children;
}

function prune(obj, keys) {
    keys.forEach(function(key) {
        delete obj[key];
    });
    return obj;
}

function keepKeys(obj, keys) {
    Object.keys(obj).forEach(function(key) {
        if (keys.indexOf(key) == -1) {
            delete obj[key];
        }
    });
    return obj;
}

function renderPage(req, res, next, data, template) {
    if (req.params.ext && req.params.ext !== 'debug') {
        next();
        return;
    }
    data._meta = data._meta || {};
    data._meta.imageCache = data._meta.imageCache || imageCachePrefix;
    data._meta.clientTileApi = data._meta.tileApi || clientTileApi;
    data._meta.title = data._meta.title || req.originalUrl;
    data._meta.domain = config.domain;
    data._meta.originalUrl = req.originalUrl;
    data._meta.fbAppId = config.fbAppId;
    data._meta.locale = res.locale;
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
    renderPage: renderPage,
    prune: prune,
    keepKeys: keepKeys
};
