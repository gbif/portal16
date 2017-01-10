'use strict';

/**
 * @fileoverview Offer regional breakdown of literature
 * , which is required for the GBIF Network page.
 */
let helper = require('../../util/util'),
    Q = require('q'),
    dataApi = require('../../gbifdata/apiConfig'),
    cmsApi = require('../apiConfig'),
    DirectoryParticipants = require('../../gbifdata/directory/directoryParticipants'),
    log = require('../../../../config/log'),
    _ = require('lodash');

let Literature = function (record) {
    this.record = record;
};

Literature.prototype.record = {};

Literature.groupBy = (region) => {
    let deferred = Q.defer(),
        literature = [];

    // First get participants of the region, then concat literature results by country.
    DirectoryParticipants.groupBy({'gbifRegion':region})
        .then(result => {
            let tasks = [];
            result.forEach(p => {
                tasks.push(helper.getApiDataPromise(cmsApi.search.url + '?filter[type]=literature&filter[category_author_from_country]=' + p.countryCode)
                    .then(result => {
                        literature = literature.concat(result.results);
                    })
                    .catch(e => {
                        log.info(e);
                    })
                );
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
                    deferred.resolve(literature);
                })
                .catch(e => {
                    deferred.reject(e + ' in literature.groupBy().');
                });

        });

    return deferred.promise;
};

module.exports = Literature;