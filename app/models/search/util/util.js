var request = require('request'),
    confidenceThreshold = 80;

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
    if (matches.length < 2) {
        return matches;
    }
    var requiredMatchType = matches[0].matchType;
    return matches.filter(function(e) {
        return e.matchType == requiredMatchType;
    })
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

function getApiData(path, callback) {
    var data;


    var timeoutProtect = setTimeout(function() {
        // if timeout already have been triggered then do nothing
        // if (!timeoutProtect) {
        //     return
        // }
        // Clear the local timer variable, indicating the timeout has been triggered.
        timeoutProtect = null;
        // Execute the callback with an error argument.
        callback(new Error('Timeout: ' + path));
    }, 4000);

    request(path, function(err, response, body) {
        //if timeout already have been triggered then do nothing
        if (!timeoutProtect) {
            return
        }
        // Clear the local timer variable, indicating the timeout has been triggered.
        clearTimeout(timeoutProtect);
        if(err) {
            //TODO log error
            console.log('ERROR PATH ' + path);
            console.log('ERROR ' + err.message);
            callback(new Error('Unable to get data from API : ' + err.message));
            return;
        }
        if (response.statusCode != 200) {
            console.log(response.statusCode);
            callback(new Error('Status code : ' + response.statusCode));
            return;
        }
        try {
            data = JSON.parse(body);
        } catch(err) {
            //TODO log that parsing went wrong
            console.log('PARSING ERROR');
            console.log(body);
            callback(err);
            return;
        }

        callback(null, data);
    });
}

module.exports = {
    getApiData: getApiData,
    getMatchesByConfidence: getMatchesByConfidence,
    filterByMatchType: filterByMatchType,
    getSynonymKey: getSynonymKey,
    getHigestRankingLowerClasses: getHigestRankingLowerClasses
}