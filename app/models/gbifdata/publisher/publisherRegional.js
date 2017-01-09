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

let publisherRegional = function (record) {
    this.record = record;
};

publisherRegional.prototype.record = {};

/**
 * @param region GBIF region enumeration
 */
publisherRegional.groupBy = (region) => {
    let deferred = Q.defer(),
        publishers = [],
        requestUrl = dataApi.publisher.url,
        gbifRegionEnum = ['AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA'];

    helper.getApiDataPromise(requestUrl, {'qs': {'limit': 50}})
        .then(result => {
            // Get all publishers from GBIF API
            let tasks = [],
                limit = 50,
                offset = 0;
            publishers = publishers.concat(result.results);

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
                .catch((e) => {
                    deferred.reject(e + ' in publisherRegional.groupBy().')
                });
        })
        .then(publishers => {
            // Breakdown to region if param exists
            if (!region) {
                return deferred.resolve(publishers);
            }
            else if (gbifRegionEnum.indexOf(region) !== -1) {
                DirectoryParticipants.groupBy({'gbifRegion': region})
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





module.exports = publisherRegional;
