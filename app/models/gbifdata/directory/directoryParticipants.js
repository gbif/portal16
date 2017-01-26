'use strict';

// @todo merge with directory.js after readability refactor

const Q = require('q'),
      _ = require('lodash'),
      NodeCache = require('node-cache'),
      directoryCache = new NodeCache(),
      helper = require('../../util/util'),
      dataApi = require('../apiConfig'),
      log = require('../../../../config/log'),
      Directory = require('./directory');

let DirectoryParticipants = function (record) {
    this.record = record;
};

DirectoryParticipants.prototype.record = {};

DirectoryParticipants.activeMembershipTypes = ['voting_participant', 'associate_country_participant', 'other_associate_participant'];

// accepts gbifRegion & membershipType as params
// /api/directory/participants?gbifRegion=AFRICA&membershipType=associate_country_participant
DirectoryParticipants.groupBy = (query) => {
    let deferred = Q.defer(),
        requestUrl = dataApi.directoryParticipants.url,
        options = Directory.authorizeApiCall(requestUrl),
        allParticipants;

    directoryCache.get('allParticipants', (err, value) => {
        if (err) {
            return deferred.reject(err);
        }

        if (value == undefined) {
            helper.getApiDataPromise(requestUrl, options)
                .then(result => {
                    directoryCache.set('allParticipants', result.results, 3600, (err, success) => {
                        if (!err && success) {
                            log.info('Variable allParticipants cached, valid for 3600 seconds.');
                        }
                        else {
                            log.error('Variable allParticipants failed to cache.');
                        }
                    });
                    deferred.resolve(groupBy(result.results, query));
                })
                .catch(e => {
                    deferred.reject(e + ' in directoryParticipants(). ');
                    log.error(e);
                });
        }
        else {
            allParticipants = value;
            deferred.resolve(groupBy(allParticipants, query));
        }
    });
    return deferred.promise;
};

function groupBy(participants, query) {
    let output = {};
    let participantsByRegion;
    let participantsByMembership;

    participants.forEach(p => {
        Directory.setMembership(p);
    });

    if (typeof query === 'undefined' || (Object.keys(query).length === 0 && query.constructor === Object)) {
        return output = participants;
    }
    else {
        // if gbifRegion is in params
        if (query.hasOwnProperty('gbifRegion')) {
            participantsByRegion = _.groupBy(participants, p => {
                return (p.hasOwnProperty('gbifRegion')) ? p.gbifRegion : 'NON_ACTIVE';
            });
            participantsByRegion.GLOBAL = participants;
            if (typeof query.gbifRegion !== 'undefined' && participantsByRegion.hasOwnProperty(query.gbifRegion)) {
                output = participantsByRegion[query.gbifRegion];
            }
        }

        // if membershipType is in params
        if (query.hasOwnProperty('membershipType')) {
            participantsByMembership = _.groupBy(participants, p => {
                return (p.hasOwnProperty('membershipType')) ? p.membershipType : 'NOT_SPECIFIED';
            });
            if (typeof query.membershipType !== 'undefined' && participantsByMembership.hasOwnProperty(query.membershipType)) {
                output = participantsByMembership[query.membershipType];
            }
        }

        if (query.hasOwnProperty('gbifRegion') && query.hasOwnProperty('membershipType')) {
            output = _.intersectionBy(participantsByRegion[query.gbifRegion], participantsByMembership[query.membershipType], 'countryCode');
        }
    }
    // sort by name before returning
    output.sort((a, b) => {
        return a.name - b.name;
    });
    return output;
}

module.exports = DirectoryParticipants;
