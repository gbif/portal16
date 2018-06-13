'use strict';

let _ = require('lodash');
let fs = require('fs');
let path = require('path');

module.exports = builder;

function getFile(locale, file) {
    if (locale === 'en' || fs.existsSync(path.join(__dirname, `${file}.json`))) {
        return require(file);
    } else {
        console.log(`!Attention: Translation file ${file}.json not found. Falling back to english`);
        return {};
    }
}

function builder(locale) {
    locale = locale || 'en';
    let translations = _.merge(
        {},
        getFile(locale, `./${locale}/enums/basisOfRecord`),
        getFile(locale, `./${locale}/enums/cms`),
        getFile(locale, `./${locale}/enums/continent`),
        getFile(locale, `./${locale}/enums/country`),
        getFile(locale, `./${locale}/enums/downloadFormat`),
        getFile(locale, `./${locale}/enums/endpointType`),
        getFile(locale, `./${locale}/enums/establishmentMeans`),
        getFile(locale, `./${locale}/enums/installationType`),
        getFile(locale, `./${locale}/enums/integerEnums`),
        getFile(locale, `./${locale}/enums/issueEnum`),
        getFile(locale, `./${locale}/enums/issueHelp`),
        getFile(locale, `./${locale}/enums/iucnStatus`),
        getFile(locale, `./${locale}/enums/language`),
        getFile(locale, `./${locale}/enums/license`),
        getFile(locale, `./${locale}/enums/mediaType`),
        getFile(locale, `./${locale}/enums/nameTypeEnum`),
        getFile(locale, `./${locale}/enums/nameUsageOrigin`),
        getFile(locale, `./${locale}/enums/occurrenceIssue`),
        getFile(locale, `./${locale}/enums/originEnum`),
        getFile(locale, `./${locale}/enums/projections`),
        getFile(locale, `./${locale}/enums/region`),
        getFile(locale, `./${locale}/enums/role`),
        getFile(locale, `./${locale}/enums/taxonomicStatus`),
        getFile(locale, `./${locale}/enums/participationStatus`),
        getFile(locale, `./${locale}/enums/taxonRank`),
        getFile(locale, `./${locale}/enums/typeStatus`),
        getFile(locale, `./${locale}/enums/extension`),
        getFile(locale, `./${locale}/enums/error`),
        getFile(locale, `./${locale}/enums/datasetType`),
        getFile(locale, `./${locale}/components/menu`),
        getFile(locale, `./${locale}/components/feedback`),
        getFile(locale, `./${locale}/components/filters`),
        getFile(locale, `./${locale}/components/nameParser`),
        getFile(locale, `./${locale}/components/footer`),
        getFile(locale, `./${locale}/components/filterNames`),
        getFile(locale, `./${locale}/components/occurrenceKey/ocurrenceFieldNames`),
        getFile(locale, `./${locale}/components/occurrenceKey/occurrenceKey`),
        getFile(locale, `./${locale}/components/occurrenceSearch`),
        getFile(locale, `./${locale}/components/downloadReport`),
        getFile(locale, `./${locale}/components/validation`),
        getFile(locale, `./${locale}/components/health`),
        getFile(locale, `./${locale}/components/gbifNetwork`),
        getFile(locale, `./${locale}/components/network`),
        getFile(locale, `./${locale}/components/terms`),
        getFile(locale, `./${locale}/components/participationStatus`),
        getFile(locale, `./${locale}/components/map`),
        getFile(locale, `./${locale}/components/species`),
        getFile(locale, `./${locale}/components/homepage`),
        getFile(locale, `./${locale}/components/taxon`),
        getFile(locale, `./${locale}/components/profile`),
        getFile(locale, `./${locale}/components/cms`),
        getFile(locale, `./${locale}/components/downloads`),
        getFile(locale, `./${locale}/components/directory`),
        getFile(locale, `./${locale}/components/contactUs`),
        getFile(locale, `./${locale}/components/metrics`),
        getFile(locale, `./${locale}/components/resource`),
        getFile(locale, `./${locale}/components/dataset`),
        getFile(locale, `./${locale}/components/tools`),
        getFile(locale, `./${locale}/components/search`),
        getFile(locale, `./${locale}/components/publisher`),
        getFile(locale, `./${locale}/components/country`),
        getFile(locale, `./${locale}/components/trends`),
        getFile(locale, `./${locale}/components/eoi`),
        getFile(locale, `./${locale}/intervals`),
        getFile(locale, `./${locale}/misc`)
    );

    return translations;
}
