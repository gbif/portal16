/**
 * version 1.
 * Locked order. Occurrence list independent of species.
 * no country detection
 * @type {exports|module.exports}
 */
var helper = require('../../models/util/util'),
    baseConfig = require('../../../config/config'),
    _ = require('lodash'),
    async = require('async');

function getAdditionalDataFromMatchedTaxon(taxon, cb) {
    var key = taxon.usageKey;
    if (typeof taxon.synonym !== 'undefined') {
        key = helper.getSynonymKey(taxon) || key;
    }
    async.auto(
        {
            info: function (callback) {
                helper.getApiData(baseConfig.dataApi + 'species/' + key, callback);
            },
            occurrences: function (callback) {
                helper.getApiData(baseConfig.dataApi + 'occurrence/search?limit=10&taxonKey=' + key, callback);
            },
            images: function (callback) {
                helper.getApiData(baseConfig.dataApi + 'occurrence/search?limit=10&mediatype=stillimage&taxonKey=' + key, callback);
            },
            holotypes: function (callback) {
                //Only show holotypes if it is a species
                if (taxon.rank == 'SPECIES' || taxon.rank == 'FAMILY' || taxon.rank == 'GENUS') {
                    helper.getApiData(baseConfig.dataApi + 'occurrence/search?limit=5&typestatus=holotype&taxonKey=' + key, callback);
                } else {
                    callback(null, null);
                }
            },
            featuredHolotype: ['holotypes', function (results, callback) {
                if (!results.holotypes || typeof results.holotypes.errorType != 'undefined' || results.holotypes.count == 0) {
                    callback(null, null);
                } else {
                    var publishingOrgKey = results.holotypes.results[0].publishingOrgKey;
                    helper.getApiData(baseConfig.dataApi + 'organization/' + publishingOrgKey, callback);
                }
            }]
        },
        function (err, data) {
            if (err) {
                //FAILED GETTING SOME OR ALL DATA
                console.log(err);
                console.log(data);
                //TODO log error
            }
            if (typeof data.info.errorType !== 'undefined') {
                //cb(new Error('failed to get species info'), null);
                cb(null, data.info);
            } else {
                var aggregatedData = data;
                if (taxon.synonym) {
                    aggregatedData.synonym = taxon;
                }
                //show occurrences if images if there is enough - else simply show what ever occurrences we have
                if (aggregatedData.images && aggregatedData.images.count > 10) {
                    aggregatedData.displayedOccurrences = aggregatedData.images;
                } else {
                    aggregatedData.displayedOccurrences = aggregatedData.occurrences;
                }
                cb(null, aggregatedData);
            }
        }
    );
}
function augmentSpeciesData(rawTaxaMatches, cb) {
    //for each match add additional data about the species
    async.map(rawTaxaMatches, getAdditionalDataFromMatchedTaxon, function (err, result) {
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

function getData(query, cb) {
    var q = encodeURIComponent(query);
    async.auto(
        {
            rawTaxaMatches: function (callback) {
                helper.getApiData(baseConfig.dataApi + 'species/match?verbose=true&name=' + q, function (err, data) {
                    if (typeof data.errorType !== 'undefined') {
                        callback(err, data)
                    } else if (data) {
                        var confidentMatches = helper.getMatchesByConfidence(data);
                        confidentMatches = helper.filterByMatchType(confidentMatches);
                        confidentMatches = helper.filterByExactQuery(confidentMatches, query); //necessary since the current species match api doesn't not account for author
                        callback(err, confidentMatches)
                    }
                    else {
                        callback(err, null)
                    }
                });
            },
            taxaMatches: [
                'rawTaxaMatches', function (results, callback) {
                    if (typeof results.rawTaxaMatches.errorType !== 'undefined' || results.rawTaxaMatches.length == 0) {
                        callback(null, null);
                    } else {
                        augmentSpeciesData(results.rawTaxaMatches, function (err, data) {
                            callback(err, data);
                        });
                    }
                }
            ],
            catalogNumberOccurrences: [
                'rawTaxaMatches', function (results, callback) {
                    if (typeof results.rawTaxaMatches.errorType !== 'undefined' || results.rawTaxaMatches.length != 0) {
                        callback(null, null);
                    } else {
                        helper.getApiData(baseConfig.dataApi + 'occurrence/search?limit=5&catalogNumber=' + q, callback);
                    }
                }
            ],
            occurrences: [
                'rawTaxaMatches', 'catalogNumberOccurrences', function (results, callback) {
                    if (typeof results.rawTaxaMatches.errorType !== 'undefined' || results.rawTaxaMatches.length > 0 || (results.catalogNumberOccurrences && results.catalogNumberOccurrences.count > 0)) {
                        callback(null, null);
                    } else {
                        helper.getApiData(baseConfig.dataApi + 'occurrence/search?limit=10&q=' + q, callback);
                    }
                }
            ],
            occurrencesImagesLocation: [
                'rawTaxaMatches', 'catalogNumberOccurrences', function (results, callback) {
                    if (typeof results.rawTaxaMatches.errorType !== 'undefined' || results.rawTaxaMatches.length > 0 || (results.catalogNumberOccurrences && results.catalogNumberOccurrences.count > 0)) {
                        callback(null, null);
                    } else {
                        helper.getApiData(baseConfig.dataApi + 'occurrence/search?HAS_COORDINATE=true&MEDIA_TYPE=StillImage&limit=10&q=' + q, callback);
                    }
                }
            ],
            //species: [
            //    'rawTaxaMatches', function(results, callback) {
            //        if (typeof results.rawTaxaMatches.errorType !== 'undefined' || results.rawTaxaMatches.length > 0) {
            //            callback(null, null);
            //        } else {
            //            helper.getApiData(baseConfig.dataApi + 'species/search?limit=5&dataset_key=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&q=' + q, callback);//TODO move backbone datasetkey to variable
            //        }
            //    }
            //],
            datasets: function (callback) {
                helper.getApiData(baseConfig.dataApi + 'dataset/search?limit=3&hl=true&q=' + q, callback);
            },
            publishers: function (callback) {
                helper.getApiData(baseConfig.dataApi + 'organization?limit=3&q=' + q, callback);
            },
            cms: function (callback) {
                helper.getApiData(baseConfig.cmsApi + 'search/' + q + '?page[size]=10', callback);
            },
            country: function (callback) {
                helper.getApiData(baseConfig.dataApi + 'directory/participant?q=' + q, function (err, data) {
                    if (err) {
                        callback(err, data);
                        return;
                    } else if (!_.isUndefined(data.errorType)) {
                        callback(err, data);
                        return;
                    } else if (data.count != 1 || data.results[0].type != 'COUNTRY') {
                        callback(err, null);
                        return;
                    } else {
                        callback(err, data.results[0]);
                    }
                });
            },
            countryAbout: [
                'country', function (results, callback) {
                    var countryCode = _.get(results, 'country.countryCode');
                    if (!countryCode) {
                        callback(null, null);
                    } else {
                        helper.getApiData(baseConfig.dataApi + 'occurrence/search?limit=0&country=' + countryCode, callback);
                    }
                }
            ],
            countryFrom: [
                'country', function (results, callback) {
                    var countryCode = _.get(results, 'country.countryCode');
                    if (!countryCode) {
                        callback(null, null);
                    } else {
                        helper.getApiData(baseConfig.dataApi + 'occurrence/search?limit=0&publishingCountry=' + countryCode, callback);
                    }
                }
            ]
        },
        cb
    );
}

function isPartialResponse(results) {
    "use strict";

    let expectedKeys = [
        'rawTaxaMatches',
        'taxaMatches',
        'catalogNumberOccurrences',
        'occurrences',
        'datasets',
        'publishers',
        'cms',
        'country'
    ];

    for (var i = 0; i < expectedKeys.length; i++) {
        let e = expectedKeys[i],
            data = results[e];
        if (_.isArray(data)) {
            for (var j = 0; j < data.length; j++) {
                if (_.isObject(data[i]) && !_.isUndefined(data[i].errorType)) {
                    return true;
                }
            }
        } else if (_.isObject(data)) {
            if (!_.isUndefined(data.errorType)) {
                results[e] = undefined;
                return true;
            }
        }
    }
    return false;
}

function search(q, cb) {
    getData(q, function (err, results) {

        results.isPartialResponse = isPartialResponse(results);
        if (results.occurrencesImagesLocation && results.occurrences && results.occurrencesImagesLocation.count >= 10) {
            results.displayedOccurrences = results.occurrencesImagesLocation;
        } else {
            results.displayedOccurrences = results.occurrences;
        }

        if (err) {
            console.log(err);
        }
        cb(results);
    });
}

module.exports = (function () {
    return {
        search: search
    };
})();
