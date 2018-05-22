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
    dataApi = require('../apiConfig'),
    DirectoryParticipants = require('../directory/directoryParticipants'),
    PublisherRegional = require('../publisher/publisherRegional'),
    log = require('../../../../config/log');

let theGbifNetwork = {};

/**
 * Get only counts of network entities (participants, publishers, literature).
 * @param query
 */


theGbifNetwork.counts = (query) => {
    if (!query.hasOwnProperty('gbifRegion') || query.gbifRegion === undefined) {
        query.gbifRegion = 'GLOBAL';
    }
    let count = {};

    query.membershipType = 'voting_participant';
    return DirectoryParticipants.groupBy(query)
        .then((result) => {
            count[query.membershipType] = result.length;
            query.membershipType = 'associate_country_participant';
            return DirectoryParticipants.groupBy(query);
        })
        .then((result) => {
            count[query.membershipType] = result.length;
            query.membershipType = 'other_associate_participant';
            return DirectoryParticipants.groupBy(query);
        })
        .then((result) => {
            count[query.membershipType] = result.length;
            query.membershipType = 'gbif_affiliate';
            return DirectoryParticipants.groupBy(query);
        })
        .then((result) => {
            count[query.membershipType] = result.length;

            // add regional publishers
            return PublisherRegional.groupBy(query);
        })

        .then((publishers) => {
            count['publisher'] = publishers.length;
            return count;
        })
        .catch((e) => {
            log.error(e.message + ' at count().');
        });
};

/**
 * 1) Get country objects from our country enumeration.
 * 2) Decorate objects with data/dataset counts and attributes.
 * 3) Decorate objects with literature counts.
 * 4) Decorate objects with participant details.
 */
theGbifNetwork.getCountries = (iso2) => {
    let requestUrl = dataApi.countryEnumeration.url;
    let options = {
        timeoutMilliSeconds: 10000,
        retries: 5,
        failHard: true
    };

    let promises = [helper.getApiDataPromise(requestUrl, options), theGbifNetwork.getCountryFacets()];

    return Q.all(promises)
        .then((result) => {
            let countries = result[0];
            let facetMap = result[1];
            let countryTasks = [];

            // if iso2 is specified, reduce the countries array.
            if (typeof iso2 !== 'undefined') {
                countries = countries.filter((country) => {
                    return country.iso2 === iso2;
                });
            }

            countries.forEach((country, i) => {
                countryTasks.push(theGbifNetwork.getDataCount(country, facetMap)
                    .then((countryWCount) => {
                        countries[i] = countryWCount;
                    }));
            });
            return Q.all(countryTasks)
                .then(() => {
                    return countries;
                });
        })
        .catch((err) => {
            log.error(err + ' getCountries().');
        });
};


theGbifNetwork.getCountryFacets = () => {
    let countryFacetUrl = 'search?limit=0&facet=publishingCountry&publishingCountry.facetLimit=1000';

    let countryOccurrenceFacets = helper.getApiDataPromise(dataApi.occurrence.url + countryFacetUrl),
        countryDatasetFacets = helper.getApiDataPromise(dataApi.dataset.url + countryFacetUrl);

    let countMap = {};

    return Q.all([countryOccurrenceFacets, countryDatasetFacets])
        .then(function(facets) {
            let occurrenceCounts = facets[0].facets[0].counts;
            let datasetCounts = facets[1].facets[0].counts;
            for (let i = 0; i < occurrenceCounts.length; i++) {
                countMap[occurrenceCounts[i].name] = {occurrenceFromCount: occurrenceCounts[i].count};
            }

            for (let i = 0; i < datasetCounts.length; i++) {
                if (countMap[datasetCounts[i].name]) {
                    countMap[datasetCounts[i].name].datasetFromCount = datasetCounts[i].count;
                } else {
                    countMap[datasetCounts[i].name] = {datasetFromCount: datasetCounts[i].count};
                }
            }

            return countMap;
        });
};

/**
 * Gather specified API calls to digest for counts.
 * @param participant
 */
theGbifNetwork.getDataCount = (participant, facetMap) => {
    let functionName = participant.type === 'OTHER' ? 'getOapDataCount' : 'getCountryDataCount';

    return theGbifNetwork[functionName](participant, facetMap)
        .catch(function(err) {
            log.error(err);
        });
};

theGbifNetwork.getCountryDataCount = (country, facetMap) => {
    if (facetMap[country.iso2]) {
        country.counts = facetMap[country.iso2];

        if (typeof country.counts.occurrenceFromCount === 'undefined') {
            country.counts.occurrenceFromCount = 0;
        } else if (typeof country.counts.datasetFromCount === 'undefined') {
            country.counts.datasetFromCount = 0;
        }
    } else {
        country.counts = {occurrenceFromCount: 0, datasetFromCount: 0};
    }

    return Q.resolve(country);
};

theGbifNetwork.getOapDataCount = (participant) => {
    let occurrenceFromCount = 0,
        datasetFromCount = 0;
    return theGbifNetwork.getNodes(participant.id)
        .then((nodes) => {
            let publishers = [];
            let publisherTasks = [];
            nodes.forEach((node) => {
                publisherTasks.push(theGbifNetwork.getAllPublishers(node.key)
                    .then((nodesPublishers) => {
                        publishers = publishers.concat(nodesPublishers);
                    })
                );
            });

            participant._nodes = nodes;

            return Q.all(publisherTasks)
                .then(() => {
                    return publishers;
                });
        })
        .then((publishers) => {
            let tasks = [];
            let options = {
                timeoutMilliSeconds: 10000,
                retries: 5,
                failHard: true
            };

            // add up both dataset and occurrence count.
            publishers.forEach((pub) => {
                let url = dataApi.occurrenceSearch.url + '?publishingOrg=' + pub.key;
                tasks.push(helper.getApiDataPromise(url, options)
                    .then((result) => {
                        occurrenceFromCount += result.count;
                        url = dataApi.datasetSearch.url + '?publishingOrg=' + pub.key;
                        return helper.getApiDataPromise(url, options);
                    })
                    .then((result) => {
                        datasetFromCount += result.count;
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
                });
        })
        .catch((e) => {
            log.error(e);
        });
};

theGbifNetwork.getNodes = (participantId) => {
    let url = dataApi.node.url;
    return helper.getApiDataPromise(url, {'qs': {'identifier': participantId}})
        .then((result) => {
            return result.results;
        })
        .catch((e) => {
            log.error(e);
        });
};

theGbifNetwork.getAllPublishers = (nodeUuid) => {
    let publishers = [],
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
    return helper.getApiDataPromise(url, options)
        .then((result) => {
            publishers = publishers.concat(result.results);

            if (publishers.length === result.count) {
                return publishers;
            } else {
                let tasks = [],
                    offset = 0;

                do {
                    offset += 20;
                    options.qs.offset = offset;
                    tasks.push(helper.getApiDataPromise(url, options)
                        .then((result) => {
                            publishers = publishers.concat(result.results);
                        })
                    );
                } while (offset < result.count);

                return Q.all(tasks)
                    .then(() => {
                        return publishers;
                    });
            }
        })
        .catch((e) => {
            log.error(e);
        });
};


theGbifNetwork.validateParticipants = (participants) => {
    let valid = true;
    participants.forEach((p) => {
        if (typeof p === 'undefined' || !p.hasOwnProperty('id')) {
            valid = false;
        }
    });
    return valid;
};

module.exports = theGbifNetwork;
