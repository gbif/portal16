'use strict';
let _ = require('lodash'),
    Node = require('../../../models/gbifdata/gbifdata').Node,
    helper = rootRequire('app/models/util/util');

function getCountryData(countryCode, cb) {
    Node.getByCountryCode(countryCode, {expand: ['participant', 'news', 'events', 'dataUse']}).then(function(node) {
        if (!_.isUndefined(_.get(node, 'participant.errorType'))) {
            delete node.participant;
            cb(null, node);
        } else {
            let rssFeed = _.get(node, 'participant.data[0].rssFeed[0].url');
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
    }, function(err) {
        cb(err);
    });
}

function getParticipant(countryCode, cb) {
    Node.getByCountryCode(countryCode).then(function(node) {
        cb(null, node);
    }, function(err) {
        cb(err);
    });
}

module.exports = {
    getCountryData: getCountryData,
    getParticipant: getParticipant
};

