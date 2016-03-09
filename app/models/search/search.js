/**
 * version 1.
 * Locked order. Occurrence list independent of species.
 * no country detection
 *
 *
 * version 2.
 * prioritize results based on likelihood. Species should not always be on top.
 *
 * TODO: Retry on error. Do not fail hard. Log errors. Return whatever we have within n seconds
 *
 *
 * @type {exports|module.exports}
 */
var queryString = require('queryString'),
    request = require('request'),
    helper = require('./util/util'),
    async = require('async');

function augmentSpeciesData(speciesMatches, cb) {
    //for each match add additional data about the species
    async.each(speciesMatches, function(species, cb) {
        async.parallel(
            {
                media: function(callback){
                    //media
                    helper.getApiData('http://api.gbif.org/v1/species/' + species.usageKey + '/media', callback);
                },
                occurrences: function(callback){
                    //occurrences
                    helper.getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&taxonKey=' + species.usageKey, callback);
                },
                images: function(callback){
                    //images
                    helper.getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&mediatype=stillimage&taxonKey=' + species.usageKey, callback);
                },
                holotypes: function(callback){
                    //images
                    helper.getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&typestatus=holotype&taxonKey=' + species.usageKey, callback);
                }
            },
            function(err, data) {
                if (err) {
                    console.log(err);//FAILED GETTING SOME OR ALL DATA
                    cb('failed to run async.each');
                    return;
                }
                //add returned data from parallel calls to species
                species._custom = data;
                cb(err, data);
            }
        );
    }, function(err){
        if (err) {
            console.log(err);//FAILED GETTING SOME OR ALL DATA
            cb('failed to run async.each');
            return;
        }
        cb(null, true);
    });
    
}

function getData(q, cb) {
    async.auto(
        {
            speciesMatches: function(callback) {
                helper.getApiData('http://api.gbif.org/v1/species/match?verbose=true&name=' + q, function(err, data) {
                    if (data) {
                        var confidentMatches = helper.getMatchesByConfidence(data);
                    }
                    callback(err, confidentMatches)
                });
            },
            speciesMatchData: [
                'speciesMatches', function(callback, results) {
                    if (results.speciesMatches.length == 0) {
                        callback(null, null);
                    } else {
                        augmentSpeciesData(results.speciesMatches, function(err, data){
                            callback(err, data);
                        });
                    }
                }
            ],
            catalogNumberOccurrences: [
                'speciesMatches', function(callback, results) {
                    if (results.speciesMatches.length > 0) {
                        callback(null, null);
                    } else {
                        helper.getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&catalogNumber=' + q, callback);
                    }
                }
            ],
            occurrences: [
                'speciesMatches', 'catalogNumberOccurrences', function(callback, results) {
                    if (results.speciesMatches.length > 0 || results.catalogNumberOccurrences.results.length > 0) {
                        callback(null, null);
                    } else {
                        helper.getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&q=' + q, callback);
                    }
                }
            ],
            species: [
                'speciesMatches', function(callback, results) {
                    if (results.speciesMatches.length > 0) {
                        callback(null, null);
                    } else {
                        helper.getApiData('http://api.gbif.org/v1/species/search?limit=5&q=' + q, callback);
                    }
                }
            ],
            images: [
                'speciesMatches', function(callback, results) {
                    if (results.speciesMatches.length > 0) {
                        callback(null, null);
                    } else {
                        helper.getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&mediatype=stillimage&q=' + q, callback);
                    }
                }
            ],
            datasets: function(callback) {
                //datasets
                helper.getApiData('http://api.gbif.org/v1/dataset/search?limit=5&q=' + q, callback);
            },
            publishers: function(callback) {
                //publishers
                helper.getApiData('http://api.gbif.org/v1/organization?limit=5&q=' + q, callback);
            },
            articles: function(callback){
                 helper.getApiData('http://www.gbif-dev.org/api/search/' + q, callback);
             }
        },
        cb
    );
}

function search(q, cb) {
    console.log('SEARCH STRING ' + q);
    getData(q, function(err, results){

        //console.log('RESULTS');
        //console.log(results);
        if (err) {
            console.log(err);
        }
        cb(results);
    });
}

module.exports = (function(){
    return {
        search: search
    };
})();