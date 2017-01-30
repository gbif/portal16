'use strict';

/**
 * @fileoverview Offer regional breakdown of literature
 * , which is required for the GBIF Network page.
 */
const Q = require('q'),
      helper = require('../../util/util'),
      cmsApi = require('../apiConfig'),
      log = require('../../../../config/log'),
      DirectoryParticipants = require('../../gbifdata/directory/directoryParticipants');

let Literature = function (record) {
    this.record = record;
};

Literature.prototype.record = {};

/**
 * Use CMS API count endpoint to retrieve relevant literature counts by region.
 * @param query
 */
Literature.countBy = query => {
    let deferred = Q.defer();
    let options = {
        timeoutMilliSeconds: 10000,
        retries: 5,
        failHard: true
    };
    // First get participants of the region, then concat literature results by country.
    if (query === undefined || !query.hasOwnProperty('gbifRegion') || !query.gbifRegion) {
        query.gbifRegion = 'GLOBAL';
    }
    helper.getApiDataPromise(cmsApi.count.url + 'literature/' + query.gbifRegion, options)
        .then(result => {
            deferred.resolve(result);
        })
        .catch(e => {
            let reason = e + ' in Literature.countBy().';
            log.info(reason);
            deferred.reject(reason);
        });
    return deferred.promise;
};

Literature.yearly = query => {
    let deferred = Q.defer();
    let options = {
        timeoutMilliSeconds: 10000,
        retries: 5,
        failHard: true
    };

    // First get participants of the region, then concat literature results by country.
    if (query === undefined || !query.hasOwnProperty('gbifRegion') || !query.gbifRegion) {
        query.gbifRegion = 'GLOBAL';
    }
    helper.getApiDataPromise(cmsApi.count.url + 'literature-yearly/' + query.gbifRegion, options)
        .then(result => {
            deferred.resolve(result);
        })
        .catch(e => {
            let reason = e + ' in Literature.yearly().';
            log.info(reason);
            deferred.reject(reason);
        });
    return deferred.promise;
};

/**
 * Retrieve documents by region.
 * @param query
 */
Literature.groupBy = query => {
    let deferred = Q.defer(),
        literatureRegional = {
            'literature': [],
            'countries': []
        },
        countries = [],
        literature = [],
        authors = 0;

    let options = {
        timeoutMilliSeconds: 10000,
        retries: 5,
        failHard: false
    };

        // First get participants of the region, then concat literature results by country.
        if (query === undefined || !query.hasOwnProperty('gbifRegion' || query.gbifRegion === undefined)) {
            query.gbifRegion = 'GLOBAL';
        }
        DirectoryParticipants.groupBy(query)
            .then(result => {
                let tasks = [];
                result.forEach(p => {
                    if (p.hasOwnProperty('countryCode') && p.countryCode !== undefined) {
                        tasks.push(helper.getApiDataPromise(cmsApi.search.url + '?filter[type]=literature&filter[category_author_from_country]=' + p.countryCode, options)
                            .then(result => {
                                if (result.count > 0) {
                                    countries = countries.concat([p.countryCode]);
                                    literature = literature.concat(result.results);
                                    result.results.forEach(l => {
                                        authors += l.authors.length;
                                    });
                                }
                            })
                            .catch(e => {
                                log.info(e);
                                deferred.reject(e);
                            })
                        );
                    }
                });

                return Q.all(tasks)
                    .then(() => {
                        // sort by year, month, day
                        literature = literature.sort((a, b) => {
                            if (a.literatureYear > b.literatureYear) {
                                return -1;
                            }
                            else if (a.literatureYear < b.literatureYear) {
                                return 1;
                            }
                            else {
                                return b.literatureMonth - a.literatureMonth;
                            }
                        });
                        literatureRegional.region = query.gbifRegion;
                        literatureRegional.countries = countries;
                        literatureRegional.literature = literature;
                        literatureRegional.authorsCount = authors;

                        deferred.resolve(literatureRegional);
                    })
                    .catch(e => {
                        deferred.reject(e + ' in literature.groupBy().');
                    });

            })
            .catch(e => {
                let reason = e + ' in literature.groupBy().';
                log.info(reason);
                deferred.reject(reason);
            });

    return deferred.promise;
};

module.exports = Literature;
