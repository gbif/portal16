'use strict';

/*
 * @file This script collects information for use in /the-gbif-network landing page.
 * It gives:
 * 1) all country objects decorated by their membership status
 * 2) count of data publishers
 * 3) count of countries of authors
 * 4) count of authors
 * 5) count of total literature
 * And accepts region param to return results of a given GBIF defined region.
 */
let helper = require('../../util/util'),
    Q = require('q'),
    NodeCache = require('node-cache'),
    theGbifNetworkCache = new NodeCache(),
    dataApi = require('../apiConfig'),
    DirectoryParticipants = require('../directory/directoryParticipants'),
    PublisherRegional = require('../publisher/publisherRegional'),
    translationsHelper = rootRequire('app/helpers/translations'),
    log = require('../../../../config/log');

let language;

let theGbifNetwork = function (record) {
    this.record = record;
};

theGbifNetwork.prototype.record = {};

theGbifNetwork.get = function(res){
    let deferred = Q.defer();
    language = res.locals.gb.locales.current;

    getIntro(language)
        .then(function(text){
            deferred.resolve(text);
        })
        .catch(function(err){
            deferred.reject(err.message + 'at line 27.');
        });

    return deferred.promise;
};

/**
 * Get introduction text for The GBIF Network page.
 * @param language
 */
function getIntro(language) {
    let deferred = Q.defer();
    // insert intro text for each group.
    let introFile = ['theGbifNetwork/landing/'];
    translationsHelper.getTranslationPromise(introFile, language)
        .then(function(translation){
            deferred.resolve(translation);
        })
        .catch(function(err){
            deferred.reject(err.message);
        });
    return deferred.promise;
}

/**
 * Get only counts of network entities (participants, publishers, literature).
 * @param query
 */
theGbifNetwork.counts = query => {
    let deferred = Q.defer();
    if (!query.hasOwnProperty('gbifRegion') || query.gbifRegion === undefined) {
        query.gbifRegion = 'GLOBAL';
    }

    let cacheId = 'majorCounts' + query.gbifRegion;

    theGbifNetworkCache.get(cacheId, (err, value) => {
        if (err) {
            deferred.reject(err);
        }

        if (typeof value === 'object' && value.hasOwnProperty('literatureAuthorCountries')) {
            deferred.resolve(value);
        }
        else {

            // retrieve counts
            let count = {};

            query.membershipType = 'voting_participant';
            DirectoryParticipants.groupBy(query)
                .then(result => {
                    count[query.membershipType] = result.length;
                    query.membershipType = 'associate_country_participant';
                    return DirectoryParticipants.groupBy(query);
                })
                .then(result => {
                    count[query.membershipType] = result.length;
                    query.membershipType = 'other_associate_participant';
                    return DirectoryParticipants.groupBy(query);
                })
                .then(result => {
                    count[query.membershipType] = result.length;
                    query.membershipType = 'gbif_affiliate';
                    return DirectoryParticipants.groupBy(query);
                })
                .then(result => {
                    count[query.membershipType] = result.length;

                    // add regional publishers
                    return PublisherRegional.groupBy(query);
                })

                .then(publishers => {
                    count['publisher'] = publishers.length;

                    theGbifNetworkCache.set(cacheId, count, 3600, (err, success) => {
                        if (!err && success) {
                            log.info('Variable ' + cacheId + ' cached, valid for 3600 seconds.');
                        }
                        else {
                            log.error('Variable ' + cacheId + ' failed to cache.');
                        }
                    });
                    deferred.resolve(count);
                })
                .catch(e => {
                    log.info(e + ' at count().');
                    deferred.reject(e + ' at count().');
                });
        }

    });

    return deferred.promise;
};

/**
 * 1) Get country objects from our country enumeration.
 * 2) Decorate objects with data/dataset counts and attributes.
 * 3) Decorate objects with literature counts.
 * 4) Decorate objects with participant details.
 */
theGbifNetwork.getCountries = (iso2) => {
    let deferred = Q.defer();
    let requestUrl = dataApi.countryEnumeration.url;
    let options = {
        timeoutMilliSeconds: 10000,
        retries: 5,
        failHard: true
    };

    var promises = [helper.getApiDataPromise(requestUrl, options), theGbifNetwork.getCountryFacets()];

    Q.all(promises)
        .then((result) => {

          var  countries = result[0];
          var  facetMap = result[1];
            let countryTasks = [];

            // if iso2 is specified, reduce the countries array.
            if (typeof iso2 !== 'undefined') {
                countries = countries.filter(country => {
                    return country.iso2 === iso2;
                });
            }

            countries.forEach((country, i) => {
                countryTasks.push(theGbifNetwork.getDataCount(country, facetMap)
                    .then(countryWCount => {
                        countries[i] = countryWCount;
                    })
                    .catch(e => {
                        log.info(e + ' at getDataCount().')
                    }));
            });
            return Q.all(countryTasks)
                .then(() => {
                    deferred.resolve(countries);
                });
        })
        .catch(err => {
            deferred.reject(err + ' getCountries().');
        });

    return deferred.promise;
};


theGbifNetwork.getCountryFacets = () => {

    let countryFacetUrl = 'search?limit=0&facet=publishingCountry&publishingCountry.facetLimit=1000';

    let countryOccurrenceFacets = helper.getApiDataPromise(dataApi.occurrence.url + countryFacetUrl),
        countryDatasetFacets = helper.getApiDataPromise(dataApi.dataset.url + countryFacetUrl);

    var countMap = {};

    return Q.all([countryOccurrenceFacets, countryDatasetFacets])
        .then(function (facets) {

            let occurrenceCounts = facets[0].facets[0].counts;
            let datasetCounts = facets[1].facets[0].counts;
            for (var i = 0; i < occurrenceCounts.length; i++) {
                countMap[occurrenceCounts[i].name] = {occurrenceFromCount: occurrenceCounts[i].count}
            }
            ;
            for (var i = 0; i < datasetCounts.length; i++) {
                if (countMap[datasetCounts[i].name]) {
                    countMap[datasetCounts[i].name].datasetFromCount = datasetCounts[i].count;
                } else {
                    countMap[datasetCounts[i].name] = {datasetFromCount: datasetCounts[i].count};
                }
            }

            return countMap;
        });


}

/**
 * Gather specified API calls to digest for counts.
 * @param participant
 */
theGbifNetwork.getDataCount = (participant, facetMap) => {


    let deferred = Q.defer();
    let cacheId;
    if (participant.hasOwnProperty('type') && participant.type === 'OTHER') {
        cacheId = 'participant' + participant.id;
    }
    else if (participant.hasOwnProperty('type') && participant.type === 'COUNTRY') {
        cacheId = 'country' + participant.iso2;
    }
    else {
        cacheId = 'non_participant_' + participant.iso2;
    }

    let functionName = participant.type === 'OTHER' ? 'getOapDataCount' : 'getCountryDataCount';

    theGbifNetworkCache.get(cacheId, (err, value) => {
        if (err) {
            deferred.reject(err);
        }
        if (typeof value === 'object' && value.hasOwnProperty('counts')) {
            deferred.resolve(value);
        }
        else {
            return theGbifNetwork[functionName](participant, facetMap)
                .then(participant => {
                    if (participant.hasOwnProperty('counts')) {
                        theGbifNetworkCache.set(cacheId, participant, 3600, (err, success) => {
                            if (!err && success) {
                                log.info('Variable ' + cacheId + ' cached, valid for 3600 seconds.');
                            }
                            else {
                                log.error('Variable ' + cacheId + ' failed to cache.');
                            }
                        });
                    }
                    deferred.resolve(participant);
                });
        }
    });
    return deferred.promise;
};

theGbifNetwork.getCountryDataCount = (country, facetMap ) => {

    if(facetMap[country.iso2]){
        country.counts = facetMap[country.iso2];

        if(typeof country.counts.occurrenceFromCount === 'undefined'){
            country.counts.occurrenceFromCount = 0;
        } else if(typeof country.counts.datasetFromCount === 'undefined') {
            country.counts.datasetFromCount = 0;
        }
    } else {
        country.counts = {occurrenceFromCount: 0, datasetFromCount: 0}
    };

    return Q.resolve(country);


};


// theGbifNetwork.getCountryDataCount = (country ) => {
//     //  @todo include Sampling event datasets
//     let countCollection = {};
//     let callTasks = [];
//     let calls = [
//         // {'name': 'checklistDatasetAbout', 'urlTemplate': dataApi.dataset.url  + 'search?limit=10000&type=CHECKLIST&country='},
//         // {'name': 'checklistDatasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&type=CHECKLIST&publishingCountry='},
//         // {'name': 'datasetAbout', 'urlTemplate': dataApi.occurrence.url + 'counts/datasets?country='}, // return an object list of {[uuid]: count}{'name': 'datasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&publishingCountry='},
//         // {'name': 'datasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&type=OCCURRENCE&publishingCountry='}, // return an object list of {[uuid]: count}{'name': 'datasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&publishingCountry='},
//         // {'name': 'metadataDatasetAbout', 'urlTemplate': dataApi.dataset.url  + 'search?limit=10000&type=METADATA&country='},
//         // {'name': 'metadataDatasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&type=METADATA&publishingCountry='},
//         {'name': 'datasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&type=OCCURRENCE&publishingCountry='}, //  IS USED return an object list of {[uuid]: count}{'name': 'datasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&publishingCountry='},
//         {'name': 'occurrenceFrom', 'urlTemplate': dataApi.occurrence.url + 'search?limit=0&publishingCountry='},
//         // {'name': 'occurrenceContributedBy', 'urlTemplate': dataApi.occurrence.url + 'counts/publishingCountries?country='}, // returns an object list of {[enumName]: count}
//         // {'name': 'occurrenceContributingTo', 'urlTemplate': dataApi.occurrence.url + 'counts/countries?publishingCountry='}, // IS USED
//         // {'name': 'samplingEventDatasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&type=SAMPLING_EVENT&publishingCountry='}, // return an object list of {[uuid]: count}{'name': 'datasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&publishingCountry='},
//         // {'name': 'literatureAuthoredBy', 'urlTemplate': cmsApi.search.url + '?filter[type]=literature&filter[category_author_from_country]='}
//     ];
//     calls.forEach(call => {
//         callTasks.push(helper.getApiDataPromise(call.urlTemplate + country.iso2)
//             .then(result => {
//                 return processCountResult(call.name, result);
//             })
//             .then(countObj => {
//
//                 countCollection[call.name + 'Count'] = countObj.count;
//             })
//             .catch(e => {
//                 log.info(e + ' at getDataCount().')
//             }));
//     });
//     return Q.all(callTasks)
//         .then(() => {
//             country.counts = countCollection;
//             return country;
//         });
// };

theGbifNetwork.getOapDataCount = participant => {
    let deferred = Q.defer();
    let occurrenceFromCount = 0,
        datasetFromCount = 0;
    theGbifNetwork.getNodes(participant.id)
        .then(nodes => {
            let publishers = [];
            let publisherTasks = [];
            nodes.forEach(node => {
                publisherTasks.push(theGbifNetwork.getAllPublishers(node.key)
                    .then(nodesPublishers => {
                        publishers = publishers.concat(nodesPublishers);
                    })
                    .catch(e => {
                        throw new Error(e);
                    })
                );
            });

            participant._nodes = nodes;

            return Q.all(publisherTasks)
                .then(() => {
                    return publishers;
                })
                .catch(e => {
                    throw new Error(e);
                });
        })
        .then(publishers => {
            let tasks = [];
            let options = {
                timeoutMilliSeconds: 10000,
                retries: 5,
                failHard: true
            };

            // add up both dataset and occurrence count.
            publishers.forEach(pub => {
                let url = dataApi.occurrenceSearch.url + '?publishingOrg=' + pub.key;
                tasks.push(helper.getApiDataPromise(url, options)
                    .then(result => {
                        occurrenceFromCount += result.count;
                        url = dataApi.datasetSearch.url + '?publishingOrg=' + pub.key;
                        return helper.getApiDataPromise(url, options)
                    })
                    .then(result => {
                        datasetFromCount += result.count;
                    })
                    .catch(e => {
                        throw new Error(e);
                    })
                );
            });
            return Q.all(tasks)
                .then(() => {
                    participant.counts = {
                        'occurrenceFromCount': occurrenceFromCount,
                        'datasetFromCount': datasetFromCount
                    };
                    return participant;
                })
                .catch(e => {
                    throw new Error(e);
                })
        })
        .then(participant => {
            deferred.resolve(participant);
        })
        .catch(e => {
            throw new Error(e);
        });
    return deferred.promise;
};

theGbifNetwork.getNodes = participantId => {
    let deferred = Q.defer();
    let url = dataApi.node.url;
    helper.getApiDataPromise(url, {'qs': {'identifier': participantId}})
        .then(result => {
            deferred.resolve(result.results);
        })
        .catch(e => {
            deferred.reject(e);
        });
    return deferred.promise;
};

theGbifNetwork.getAllPublishers = nodeUuid => {
    let deferred = Q.defer(),
        publishers = [],
        limit = 20;

    let options = {
        timeoutMilliSeconds: 10000,
        retries: 5,
        failHard: true,
        qs: {
            'limit': limit
        }
    };

    let url = dataApi.node.url + nodeUuid + '/organization';
    helper.getApiDataPromise(url, options)
        .then(result => {
            publishers = publishers.concat(result.results);

            if (publishers.length === result.count) {
                deferred.resolve(publishers);
            }
            else {
                let tasks = [],
                    offset = 0;

                do {
                    offset += 20;
                    options.qs.offset = offset;
                    tasks.push(helper.getApiDataPromise(url, options)
                        .then(result => {
                            publishers = publishers.concat(result.results);
                        })
                        .catch(e => {
                            deferred.reject(e);
                        })
                    );
                } while (offset < result.count);

                return Q.all(tasks)
                    .then(() => {
                        deferred.resolve(publishers);
                    })
                    .catch(e => {
                        deferred.reject(e);
                    });
            }
        })
        .catch(e => {
            deferred.reject(e);
        });
    return deferred.promise;
};

/**
 * Digest dataset/record counts from various formats of API result.
 * @param name
 * @param result
 */
function processCountResult(name, result) {
    let deferred = Q.defer();
    let countObj = {};
    if (result.hasOwnProperty('count')) countObj.count = result.count;
    if (['checklistDatasetAbout', 'checklistDatasetFrom'].indexOf(name) !== -1) {
        return getChecklistMetrics(result.results)
            .then(usageCount => {
                countObj.recordCount = usageCount;
                return countObj;
            })
            .catch(e => {
                deferred.reject(e);
            });
    }
    else if (['datasetAbout', 'occurrenceContributedBy', 'occurrenceContributingTo'].indexOf(name) !== -1) {
        let recordCount = 0;
        for (let property in result) {
            if (result.hasOwnProperty(property)) {
                recordCount += result[property];
            }
        }
        countObj.count = Object.keys(result).length;
        countObj.recordCount = recordCount;
        deferred.resolve(countObj);
    }
    else if (!isNaN(result)) {
        countObj.count = result;
        deferred.resolve(countObj);
    }
    else {
        deferred.resolve(countObj);
    }
    return deferred.promise;
}

/**
 * collect the usage count of given checklist datasets.
 */
function getChecklistMetrics(results) {
    let deferred = Q.defer();
    let usagesCount = 0;
    let metricsTask = [];
    results.forEach(result => {
        metricsTask.push(helper.getApiDataPromise(dataApi.dataset.url + result.key + '/metrics')
            .then(metrics => {
                usagesCount += metrics.usagesCount;
            }));
    });
    Q.all(metricsTask)
        .then(() => {
            deferred.resolve(usagesCount);
        })
        .catch(e => {
            deferred.reject(e);
        });
    return deferred.promise;
}

theGbifNetwork.validateParticipants = participants => {
    let valid = true;
    participants.forEach(p => {
        if (!p.hasOwnProperty('id')) {
            valid = false;
        }
    });
    return valid;
};

module.exports = theGbifNetwork;
