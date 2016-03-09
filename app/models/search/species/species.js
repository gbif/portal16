/**
are there any good species match (use species match api).
    Get data. Evaluate confidence.
*/

var confidenceThreshold = 80;

function getConfidentMatchesFromResults(results) {
    var alternative,
        confidentMatches = [];

    if (results && results.confidence > confidenceThreshold && results.matchType != 'NONE') {
        delete results.alternatives;
        confidentMatches.push(results);
    } else if(results && results.alternatives) {
        for (var i=0; i < results.alternatives.length; i++) {
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


module.exports = (function(){
    return {
        getConfidentMatchesFromResults: getConfidentMatchesFromResults
    };
})();
