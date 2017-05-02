"use strict";

var apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    _ = require('lodash'),
    countries = _.mapKeys(_.invert(rootRequire('locales/server/en').country), function(value, key){
        return key.toLowerCase();
    }),
    Participant = rootRequire('app/models/node/participant'),
    chai = require('chai'),
    expect = chai.expect,
    querystring = require('querystring'),
    request = require('requestretry');

async function query(countryName){
    if (!_.isString(countryName)) {
        return
    }
    countryName = countryName.toLowerCase();
    if (countries[countryName]) {
        try {
            let participant = await Participant.getParticipantByIso(countries[countryName]);
            return {
                count: 1,
                results: [
                    {
                        countryCode: countries[countryName],
                        participant: participant.type == 'COUNTRY' ? participant : undefined
                    }
                ]
            };
        } catch(err) {
            return {
                count: 1,
                results: [
                    {
                        countryCode: countries[countryName]
                    }
                ]
            }
        }
    }
}

module.exports = {
    query: query
};

