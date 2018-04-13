'use strict';
/**
 * This is a fragile mess. Using lunr for search is no way ideal - but it is better than fuse.io as we used before.
 * the problem is that we do not a have a proper endpoint for searching for countries by their names. especiialy not in translated names.
 */
/* eslint-disable no-invalid-this */

let _ = require('lodash'),
    lunr = require('lunr'),
    locales = rootRequire('config/config').locales,
    countryCodes = rootRequire('app/models/enums/basic/country'),
    countryTranslations = {};

locales.forEach(function(locale) {
    countryTranslations[locale] = rootRequire(`locales/_build/${locale}`).country;
});

let countries = countryCodes.map(function(key) {
    let nameMap = {
        key: key
    };
    locales.forEach(function(locale) {
        nameMap[locale] = countryTranslations[locale][key].toLocaleLowerCase();
    });
    return nameMap;
});
let Participant = rootRequire('app/models/node/participant');

// create index
let idx = lunr(function() {
    let that = this;
    this.ref('key');
    this.field('da');
    locales.forEach(function(locale) {
        that.field(locale);
    });

    countries.forEach(function(doc) {
        this.add(doc);
    }, this);
});

async function query(countryName, locale) {
    countryName = '' + countryName.toLocaleLowerCase();
    let queryLocales = _.uniq([locale, 'en']);
    let result = idx.query(function(q) {
        countryName.split(lunr.tokenizer.separator).forEach(function(term) {
            q.term(term, {
                fields: queryLocales,
                editDistance: 1
            });
          });
    });

    let match = result[0];
    if (!match || match.length === 0) {
        return;
    }
    result = _.chunk(result, 2)[0];
    try {
        let resultList = [];
        for (let i = 0; i < result.length; i++) {
            let key = result[i].ref;

            let p;
            try {
                p = await Participant.getParticipantByIso(key);
            } catch (err) {
                // ignore
            }

            resultList.push({
                countryCode: key,
                participant: p && p.type == 'COUNTRY' ? p : undefined
            });
        }
        return {
            count: resultList.length,
            results: resultList
        };
    } catch (err) {
        return;
    }
}

module.exports = {
    query: query
};
