"use strict";

var _ = require('lodash'),
    Fuse = require('fuse.js'),
    countryCodes = rootRequire('app/models/enums/basic/country'),
    countryTranslations = rootRequire('locales/server/en').country,
    countries = countryCodes.map(function(key){
        return {title: countryTranslations[key], key: key }
    }),
    Participant = rootRequire('app/models/node/participant'),
    options = {
        keys: ['title'],
        threshold: 0.2,
        distance: 100,
        shouldSort: true,
        tokenize: false,
        matchAllTokens: true,
        includeScore: true
    };

var fuse = new Fuse(countries, options);

async function query(countryName){
    if (!_.isString(countryName)) {
        return;
    }
    countryName = countryName.toLowerCase();
    var countryResults = fuse.search(countryName);
    let match = countryResults[0];
    if (!match) {
        return;
    }
    var parts = match.item.title.toLowerCase().replace(',', ' ').split(' ');
    var wordCount = parts.length;
    if (match.score > 0.3 || (wordCount == 1 && match.score !== 0) || (parts[0] !== countryName && wordCount > 1 && (countryName.length/match.item.title.length) < 0.33)){
        return;
    }
    let countryKey = match.item.key;
    if (countryResults[0]) {
        try {
            let participant = await Participant.getParticipantByIso(countryKey);
            return {
                count: 1,
                results: [
                    {
                        countryCode: countryKey,
                        participant: participant.type == 'COUNTRY' ? participant : undefined
                    }
                ]
            };
        } catch(err) {
            return {
                count: 1,
                results: [
                    {
                        countryCode: countryKey
                    }
                ]
            }
        }
    }
}

module.exports = {
    query: query
};

