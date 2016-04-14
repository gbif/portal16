var request = require('request'),
    confidenceThreshold = 80;

var ERRORS = Object.freeze({
    API_TIMEOUT: 1,
    API_ERROR: 2,
    INVALID_RESPONSE: 3
});

function getMatchesByConfidence(results) {
    var alternative,
        confidentMatches = [];

    if (results && results.confidence > confidenceThreshold && results.matchType == 'EXACT') {
        delete results.alternatives;
        confidentMatches.push(results);
    } else if(results && results.alternatives) {
        for (var i=0; i < results.alternatives.length; i++) {
            alternative = results.alternatives[i];
            if ( alternative.confidence > confidenceThreshold ) {
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
    return matches.filter(function(e) {
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
    children.results = children.results.filter(function(e) {
        return e.rank == requiredRank;
    });
    return children;
}

function getApiErrorResponse(callback, reason, options, err, message) {
    //TODO log error
    console.log(reason + ' : ' + message);
    console.log(reason + ' : ' + err);
    if (options.failHard) {
        callback(err, null);
    } else {
        callback(null, {
            errorType: reason
        });
    }
}

function getApiData(path, callback, options) {
    var data;
    options = options || {};
    options.timeoutMilliSeconds = options.timeoutMilliSeconds || 4000;
    options.failHard = options.failHard || false;


    var timeoutProtect = setTimeout(function() {
        // Clear the local timer variable, indicating the timeout has been triggered.
        timeoutProtect = null;
        // Execute the callback with an error argument.
        getApiErrorResponse(callback, ERRORS.API_TIMEOUT, options, null, path + ' TIMEOUT');
    }, options.timeoutMilliSeconds);

    request(path, function(err, response, body) {
        //if timeout already have been triggered then do nothing
        if (!timeoutProtect) {
            return
        }

        // Clear the local timer variable, indicating the timeout has been triggered.
        clearTimeout(timeoutProtect);
        if(err) {
            getApiErrorResponse(callback, ERRORS.API_ERROR, options, err, path);
        } else if (response.statusCode != 200) {
            console.log(response.statusCode);
            getApiErrorResponse(callback, ERRORS.API_ERROR, options, null, path + ' - Status code: ' + response.statusCode);
            return;
        } else {
            try {
                data = JSON.parse(body);
            } catch (err) {
                getApiErrorResponse(callback, ERRORS.INVALID_RESPONSE, options, null, path);
                return;
            }

            callback(null, data);
        }
    });
}

module.exports = {
    getApiData: getApiData,
    getMatchesByConfidence: getMatchesByConfidence,
    filterByMatchType: filterByMatchType,
    getSynonymKey: getSynonymKey,
    getHigestRankingLowerClasses: getHigestRankingLowerClasses,
    filterByExactQuery: filterByExactQuery
}