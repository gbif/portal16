'use strict';

let _ = require('lodash');
let fs = require('fs');
let path = require('path');

module.exports = builder;

function getFile(locale, file) {
    if (locale === 'en' || fs.existsSync(path.join(__dirname, `${locale}${file}.json`))) {
        return require(`./${locale}${file}`);
    } else {
        console.log(`!Attention: Translation file ./${locale}${file}.json not found. Falling back to english`);
        return {};
    }
}

function builder(locale) {
    locale = locale || 'en';
    let translations = _.merge(
        {},
        require(`../server/${locale}`),
        getFile(locale, `/enums/basisOfRecord`),
        getFile(locale, `/enums/cms`),
        getFile(locale, `/enums/continent`),
        getFile(locale, `/enums/country`),
        getFile(locale, `/enums/downloadFormat`),
        getFile(locale, `/enums/endpointType`),
        getFile(locale, `/enums/establishmentMeans`),
        getFile(locale, `/enums/filterNames`),
        getFile(locale, `/enums/installationType`),
        getFile(locale, `/enums/integerEnums`),
        getFile(locale, `/enums/issueEnum`),
        getFile(locale, `/enums/issueHelp`),
        getFile(locale, `/enums/iucnStatus`),
        getFile(locale, `/enums/language`),
        getFile(locale, `/enums/license`),
        getFile(locale, `/enums/mediaType`),
        getFile(locale, `/enums/nameTypeEnum`),
        getFile(locale, `/enums/nameUsageOrigin`),
        getFile(locale, `/enums/occurrenceIssue`),
        getFile(locale, `/enums/originEnum`),
        getFile(locale, `/enums/protocol`),
        getFile(locale, `/enums/region`),
        getFile(locale, `/enums/role`),
        getFile(locale, `/enums/statusEnum`),
        getFile(locale, `/enums/taxonomicStatus`),
        getFile(locale, `/enums/taxonRank`),
        getFile(locale, `/enums/typeStatus`),
        getFile(locale, `/components/menu`),
        getFile(locale, `/components/occurrenceKey/ocurrenceFieldNames`),
        getFile(locale, `/components/occurrenceKey/occurrenceKey`),
        getFile(locale, `/components/downloadReport`),
        getFile(locale, `/components/validation`),
        getFile(locale, `/components/health`),
        getFile(locale, `/components/gbifNetwork`),
        getFile(locale, `/components/network`),
        getFile(locale, `/components/terms`),
        getFile(locale, `/components/map`),
        getFile(locale, `/components/species`),
        getFile(locale, `/components/profile`),
        getFile(locale, `/components/cms/cms`),
        getFile(locale, `/components/downloads`),
        getFile(locale, `/misc`)
    );

    return translations;
}
