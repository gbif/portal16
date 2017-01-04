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
        },
        nodeFeed: [
            'node', function (results, callback) {
                var feed,
                    endpoints = _.get(results, 'node.endpoints', []);
                endpoints.forEach(function (e) {
                    if (e.type == 'FEED' && e.url) {
                        feed = e;
                    }
                });
                if (typeof results.node.errorType !== 'undefined' || !feed) {
                    callback(null, null);
                } else {
                    helper.getApiData(feed.url, callback, {retries: 1, timeoutMilliSeconds: 1000, type: 'XML'});
                }
            }
        ]
    };

    if (typeof participant !== 'undefined') {
        participantId = participant.Nid;
        tasks.participant = function (callback) {
            helper.getApiData(cmsConfig.participant.url + participantId, callback);
        };
    }
    async.auto(tasks, cb);
}

module.exports = {
    getCountryData: getCountryData
};

