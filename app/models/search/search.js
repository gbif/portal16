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
var helper = require('./util/util'),
    async = require('async');

function getAdditionalDataFromMatchedTaxon(taxon, cb) {
    var key = taxon.usageKey;
    if (taxon.synonym) {
        key = helper.getSynonymKey(taxon) || key;
    }
    async.auto(
        {
            info: function(callback) {
                helper.getApiData('http://api.gbif.org/v1/species/' + key, callback);
            },
            media: function(callback){
                //media attached to that taxon
                helper.getApiData('http://api.gbif.org/v1/species/' + key + '/media', callback);
            },
            occurrences: function(callback){
                helper.getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&taxonKey=' + key, callback);
            },
            images: function(callback){
                helper.getApiData('http://api.gbif.org/v1/occurrence/search?limit=10&mediatype=stillimage&taxonKey=' + key, callback);
            },
            holotypes: function(callback){
                //Only show holotypes if it is a species
                if (taxon.rank == 'SPECIES') {
                    helper.getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&typestatus=holotype&taxonKey=' + key, callback);
                } else {
                    callback(null, null);
                }
            },
            children: function(callback){
                //children
                helper.getApiData('http://api.gbif.org/v1/species/' + key + '/children?limit=5', function(err, data) {
                    if (err) {
                        callback(err, data);
                    } else if(typeof data.errorType !== 'undefined') {
                        callback(null, data);
                    } else {
                        data = helper.getHigestRankingLowerClasses(data);
                        callback(err, data);
                    }
                });
            },
            featuredHolotype: ['holotypes', function(callback, results) {
                if (!results.holotypes || typeof results.holotypes.errorType != 'undefined' || results.holotypes.count == 0) {
                    callback(null, null);
                } else {
                    var publishingOrgKey = results.holotypes.results[0].publishingOrgKey;
                    helper.getApiData('http://api.gbif.org/v1/organization/' + publishingOrgKey, callback);
                }
            }]
        },
        function(err, data) {
            if (err) {
                //FAILED GETTING SOME OR ALL DATA
                console.log(err);
                console.log(data);
                //TODO log error
            }
            if (typeof data.info.errorType !== 'undefined') {
                cb(new Error('failed to get species info'), null);
            } else {
                var aggregatedData = data;
                if (taxon.synonym) {
                    aggregatedData.synonym = taxon;
                }
                cb(null, aggregatedData);
            }
        }
    );
}
function augmentSpeciesData(rawTaxaMatches, cb) {
    //for each match add additional data about the species
    async.map(rawTaxaMatches, getAdditionalDataFromMatchedTaxon, function(err, result){
        if (err) {
            console.log(err);//FAILED GETTING SOME OR ALL DATA
            //TODO log error ?
            cb(null, null);
            return;
        } else {
            cb(null, result);
        }
    });
}

function getData(q, cb) {
    q = encodeURIComponent(q);
    async.auto(
        {
            rawTaxaMatches: function(callback) {
                helper.getApiData('http://api.gbif.org/v1/species/match?verbose=true&name=' + q, function(err, data) {
                    if (typeof data.errorType !== 'undefined') {
                        callback(err, data)
                    } else if (data) {
                        var confidentMatches = helper.getMatchesByConfidence(data);
                        confidentMatches = helper.filterByMatchType(confidentMatches);
                        callback(err, confidentMatches)
                    }
                    else {
                        callback(err, null)
                    }
                });
            },
            taxaMatches: [
                'rawTaxaMatches', function(callback, results) {
                    if (typeof results.rawTaxaMatches.errorType !== 'undefined' || results.rawTaxaMatches.length == 0) {
                        callback(null, null);
                    } else {
                        augmentSpeciesData(results.rawTaxaMatches, function(err, data){
                            callback(err, data);
                        });
                    }
                }
            ],
            catalogNumberOccurrences: [
                'rawTaxaMatches', function(callback, results) {
                    if (typeof results.rawTaxaMatches.errorType !== 'undefined' || results.rawTaxaMatches.length == 0) {
                        callback(null, null);
                    } else {
                        helper.getApiData('http://api.gbif.org/v1/occurrence/search?limit=5&catalogNumber=' + q, callback);
                    }
                }
            ],
            occurrences: [
                'rawTaxaMatches', 'catalogNumberOccurrences', function(callback, results) {
                    if ( typeof results.rawTaxaMatches.errorType !== 'undefined' || results.rawTaxaMatches.length > 0  || (results.catalogNumberOccurrences && results.catalogNumberOccurrences.count > 0) ) {
                        callback(null, null);
                    } else {
                        helper.getApiData('http://api.gbif-dev.org/v1/occurrence/search?limit=5&q=' + q, callback);
                    }
                }
            ],
            species: [
                'rawTaxaMatches', function(callback, results) {
                    if (typeof results.rawTaxaMatches.errorType !== 'undefined' || results.rawTaxaMatches.length > 0) {
                        callback(null, null);
                    } else {
                        helper.getApiData('http://api.gbif.org/v1/species/search?limit=5q=' + q, callback);
                    }
                }
            ],
            datasets: function(callback) {
                helper.getApiData('http://api.gbif.org/v1/dataset/search?limit=5&q=' + q, callback);
            },
            publishers: function(callback) {
                helper.getApiData('http://api.gbif.org/v1/organization?limit=5&q=' + q, callback);
            },
            articles: function(callback){
                helper.getApiData('http://www.gbif-dev.org/api/search/' + q, callback);
            },
            country: function(callback) {
                helper.getApiData('http://api.gbif.org/v1/node?limit=1&q=' + q, function(err, data) {
                    if (err) {
                        callback(err, data);
                        return;
                    } else if (data.count != 1 || data.results[0].type != 'COUNTRY') {
                        callback(err, null);
                        return;
                    } else {
                        callback(err, data.results[0]);
                    }
                });
            }
        },
        cb
    );
}

function search(q, cb) {
    console.log('SEARCH STRING ' + q);
    getData(q, function(err, results){

        //console.log('RESULTS');

        //var expectedKeys = ['speciesMatches',
        //    'catalogNumberOccurrences',
        //    'occurrences',
        //    'species',
        //    'images',
        //    'datasets',
        //    'articles',
        //    'publishers'];
        //
        //expectedKeys.forEach(function(e){
        //    if (typeof results[e] === 'undefined') {
        //        console.log('ERROR : KEY MISSING  ' + e);
        //    }
        //});

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