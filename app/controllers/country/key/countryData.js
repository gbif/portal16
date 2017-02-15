"use strict";
var _ = require('lodash'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    cmsConfig = rootRequire('app/models/cmsData/apiConfig'),
    Node = require('../../../models/gbifdata/gbifdata').Node,
    helper = rootRequire('app/models/util/util'),
    async = require('async');

function getCountryData(countryCode, cb) {

    Node.getByCountryCode(countryCode, {expand: ['participant', 'news', 'events', 'dataUse']}).then(function (node) {
        if (!_.isUndefined(_.get(node, 'participant.errorType'))) {
            cb(node.participant);
        } else {
            var rssFeed = _.get(node, 'participant.data[0].rssFeed[0].url');
            if (!rssFeed) {
                cb(null, node);
            } else {
                helper.getApiData(rssFeed, function(err, rssData) {
                    if (err || rssData.errorType) {
                        cb(null, node);
                    } else {
                        node.rssFeed = rssData;
                        cb(null, node);
                    }
                }, {retries: 1, timeoutMilliSeconds: 3000, type: 'XML', failHard: true});
            }
        }
    });
}

module.exports = {
    getCountryData: getCountryData
};
