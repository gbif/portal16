"use strict";
var _ = require('lodash'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    cmsConfig = rootRequire('app/models/cmsData/apiConfig'),
    helper = rootRequire('app/models/util/util'),
    async = require('async'),
    participantDump = require('./participant-dump'),
    countryCodeToDrupalId = _.keyBy(participantDump, 'Participant ISO 3166-2 code'); //temporary solution because the Drupal api do not allow for getting participants by their ISO code. Instead we do a map between ISO and internal Drupal node id

function getCountryData(countryCode, cb) {
    var participantId,
        participant = countryCodeToDrupalId[countryCode.toUpperCase()];//use temporary mapping object as Drupal do not allow search by ISO

    var tasks = {
        news: function (callback) {
            helper.getApiData(cmsConfig.search.url + '?sort=-created&page[size]=3&filter[type]=news&filter[category_country]=' + countryCode, callback);
        },
        events: function (callback) {
            helper.getApiData(cmsConfig.search.url + '?sort=-created&page[size]=3&filter[type]=event&filter[category_country]=' + countryCode, callback);
        },
        dataUse: function (callback) {
            helper.getApiData(cmsConfig.search.url + '?sort=-created&page[size]=3&filter[type]=data_use&filter[category_country]=' + countryCode, callback);
        },
        node: function (callback) {
            helper.getApiData(apiConfig.country.url + countryCode, callback);
        }
    };

    if (typeof participant !== 'undefined') {
        participantId = participant.Nid;
        tasks.participant = function (callback) {
            helper.getApiData(cmsConfig.participant.url + participantId, callback);
        };
        tasks.nodeFeed = [
            'participant', function (results, callback) {
                var rssFeed = _.get(results, 'participant.data[0].rssFeed[0].url');
                if (typeof results.participant.errorType !== 'undefined' || !rssFeed) {
                    callback(null, null);
                } else {
                    helper.getApiData(rssFeed, callback, {retries: 1, timeoutMilliSeconds: 1000, type: 'XML'});
                }
            }
        ];
    }
    async.auto(tasks, cb);
}

module.exports = {
    getCountryData: getCountryData
};
