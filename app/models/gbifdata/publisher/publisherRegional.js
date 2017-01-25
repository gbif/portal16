'use strict';

/**
 * @fileoverview Offer regional breakdown of publishers/organizations
 * , which are required for the GBIF Network page.
 */

let helper = require('../../util/util'),
    Q = require('q'),
    dataApi = require('../apiConfig'),
    DirectoryParticipants = require('../directory/directoryParticipants'),
    log = require('../../../../config/log'),
    _ = require('lodash');

let PublisherRegional = function (record) {
    this.record = record;
};

PublisherRegional.prototype.record = {};

/**
 * @param query
 */
PublisherRegional.groupBy = (query) => {
    let deferred = Q.defer(),
        publishers = [],
        requestUrl = dataApi.publisher.url,
        gbifRegionEnum = ['AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA', 'GLOBAL'];

    helper.getApiDataPromise(requestUrl, {'qs': {'limit': 50}})
        .then(result => {
            // Get all publishers from GBIF API
            let tasks = [],
                limit = 50,
                offset = 0;

            publishers = publishers.concat(result.results);

            // iterate and collect publishers
            do {
                offset += 50;
                let qs = {
                    'limit': limit,
                    'offset': offset
                };
                tasks.push(helper.getApiDataPromise(requestUrl, {'qs': qs})
                    .then(result => {
                        publishers = publishers.concat(result.results);
                    })
                    .catch(e => {
                        log.info(e);
                    })
                );
            } while (offset < result.count);

            return Q.all(tasks)
                .then(() => {
                    return publishers;
                })
                .catch(e => {
                    deferred.reject(e + ' in publisherRegional.groupBy().')
                });
        })
        .then(publishers => {
            // Breakdown to region if param exists
            if (query === undefined || !query.hasOwnProperty('gbifRegion') || query.gbifRegion === undefined) {
                return deferred.resolve(publishers);
            }
            else if (gbifRegionEnum.indexOf(query.gbifRegion) !== -1) {
                DirectoryParticipants.groupBy(query)
                    .then(participants => {
                        let participantsIso2ByRegion = participants.map(participant => { return participant.countryCode; });
                        let publishersInRegion = publishers.filter(publisher => {
                            return participantsIso2ByRegion.indexOf(publisher.country) !== -1;
                        });
                        deferred.resolve(publishersInRegion);
                    });
            }
            else {
                deferred.reject('Invalid GBIF region enumeration.');
            }
        })
        .catch(e => {
            let reason = e + ' in publisherRegional.groupBy().';
            log.info(reason);
            return deferred.reject(reason);
        });

    return deferred.promise;
};

PublisherRegional.numberEndorsedBy = (iso2) => {
    let deferred = Q.defer(),
        requestUrl = dataApi.publisher.url + '?country=' + iso2;

    helper.getApiDataPromise(requestUrl, {'qs': {'limit': 20}})
        .then(result => {
            deferred.resolve(result);
        })
        .catch(e => {
            let reason = e + ' in publisherRegional.numberEndorsedBy().';
            log.info(reason);
            return deferred.reject(reason);
        });

    return deferred.promise;
};



module.exports = PublisherRegional;
