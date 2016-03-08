/**
are there any good species match (use species match api).
    Get data. Evaluate confidence.
*/

var confidenceThreshold = 80;

function getMatches(q, cb) {
    request('http://api.gbif.org/v1/species/match?verbose=true&name=' + q, function(err, response, body){
        //TODO handle errors
        var result = getConfidentMatchesFromResults(err, response, body);
        cb(result);
    })
}

function getConfidentMatchesFromResults(err, response, body) {
    var results,
        alternative,
        confidentMatches = [];

    if(err) {
        return {
            error: new Error("Could not get species matches: " + err.message)
        };
    }
    //TODO test status code
    results = JSON.parse(body);//TODO defend against error parsing?

    //select confident ones
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
    return {
        matches: confidentMatches
    };
}

function getSpecies(q, callback) {
    getMatches(q, function(data){
        if (data.error) {
            callback(data.error);
            return;
        }
        //if there are any good species matches then get data related to them. Else use free text search.
        if (data.matches.length > 0) {
            console.log('MATCHES FOUND - AUGMENT DATA');
            //there are at least one good match
            augmentSpeciesData(data.matches, function(err, data){
                //console.log(data);
                callback(err, {
                    key: 'species',
                    confident: true,
                    data: data
                });
            });
        } else {
            //there are no good matches
            getFreeTextResults(q, function(err, data) {
                callback(err, {
                    key: 'mixed',
                    confident: false,
                    data: data
                });
            });
        }
    });
}

function getFreeTextResults(q, callback) {
    var results = {};
    async.parallel(
        [
            function(callback){
                //species
                getApiData('http://api.gbif.org/v1/species/search?limit=5&q=' + q, 'species', callback);
            },
            function(callback){
                //occurrences
                getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&q=' + q, 'occurrences', callback);
            },
            function(callback){
                //images
                getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&mediatype=stillimage&q=' + q, 'images', callback);
            }
        ],
        function(err, data) {
            if (err) {
                console.log(err);//FAILED GETTING SOME OR ALL DATA
                callback('failed to run parallel free text search on species and occurrences');
                return;
            }
            //add returned data from parallel calls
            data.forEach(function(e){
                results[e.key] = e.data;
            });
            callback(err, results);
        }
    );
}

function getApiData(path, propName, callback) {
    var data;
    request(path, function(err, response, body) {
        if(err) {
            console.log('ERROR ' + err.message);
            callback(new Error('Unable to get data from API : ' + err.message));
            return;
        }
        data = JSON.parse(body);
        callback(null, {key: propName, data: data});
    });
}

function augmentSpeciesData(speciesResults, cb) {
    //for each match add additional data about the species
    async.each(speciesResults, function(species, cb) {
        async.parallel(
            [
                function(callback){
                    //media
                    getApiData('http://api.gbif.org/v1/species/' + species.usageKey + '/media', 'media', callback);
                },
                function(callback){
                    //occurrences
                    getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&taxonKey=' + species.usageKey, 'occurrences', callback);
                },
                function(callback){
                    //images
                    getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&mediatype=stillimage&taxonKey=' + species.usageKey, 'images', callback);
                },
                function(callback){
                    //images
                    getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&typestatus=holotype&taxonKey=' + species.usageKey, 'types', callback);
                }
            ],
            function(err, data) {
                if (err) {
                    console.log(err);//FAILED GETTING SOME OR ALL DATA
                    cb('failed to run async.each');
                    return;
                }
                //add returned data from parallel calls to species
                data.forEach(function(e){
                    species[e.key] = e.data;
                });
                cb(err, data);
            }
        );
    }, function(err){
        if (err) {
            console.log(err);//FAILED GETTING SOME OR ALL DATA
            cb('failed to run async.each');
            return;
        }
        cb(null, speciesResults);
    });
    
}


// function getSpeciesData(q, callback) {
//     speciesData.query(q, function(data) {
//         augmentData(data, function(data){
//             //return data
//         });
//     });
// }



var queryString = require('queryString'),
    request = require('request'),
    url = require('url'),
    async = require('async');

var types = Object.freeze({
    SPECIES: 0,
    OCCURRENCES: 1
});

var speciesSearch = {
    protocol: "http:",
    host: "api.gbif.org",
    pathname: "v1/species/search"
};

var options = {
    endpoints: {
        speciesSearch: url.format(speciesSearch) + '?',
        speciesMedia: 'http://api.gbif.org/v1/species/'
    }
};





module.exports = (function(){
    return {
        matches: getMatches,
        getSpeciesData: getSpecies
    };
})();