'use strict';

let _ = require('lodash');
let fs = require('fs');
let path = require('path');

module.exports = builder;

function getFile(locale, file) {
    if (locale === 'en-DK' || fs.existsSync(path.join(__dirname, `${file}.json`))) {
        return require(file);
    } else {
        console.log(`!Attention: Translation file ${file}.json not found. Falling back to en-DK (developers original text)`);
        return {};
    }
}

function builder(locale, folder, keepEmptyStrings) {
    folder = folder || 'translations';
    keepEmptyStrings = keepEmptyStrings || false;
    locale = locale || 'en';
    let translations = _.merge(
        {},
        getFile(locale, `./${folder}/${locale}/enums/basisOfRecord`),
        getFile(locale, `./${folder}/${locale}/enums/cms`),
        getFile(locale, `./${folder}/${locale}/enums/collectionPreservationType`),
        getFile(locale, `./${folder}/${locale}/enums/collectionContentType`),
        getFile(locale, `./${folder}/${locale}/enums/collectionAccessionStatus`),
        getFile(locale, `./${folder}/${locale}/enums/continent`),
        getFile(locale, `./${folder}/${locale}/enums/country`),
        getFile(locale, `./${folder}/${locale}/enums/discipline`),
        getFile(locale, `./${folder}/${locale}/enums/downloadFormat`),
        getFile(locale, `./${folder}/${locale}/enums/dwcaExtension`),
        getFile(locale, `./${folder}/${locale}/enums/endpointType`),
        getFile(locale, `./${folder}/${locale}/enums/establishmentMeans`),
        getFile(locale, `./${folder}/${locale}/enums/identifierType`),
        getFile(locale, `./${folder}/${locale}/enums/installationType`),
        getFile(locale, `./${folder}/${locale}/enums/institutionType`),
        getFile(locale, `./${folder}/${locale}/enums/institutionGovernance`),
        getFile(locale, `./${folder}/${locale}/enums/integerEnums`),
        getFile(locale, `./${folder}/${locale}/enums/issueEnum`),
        getFile(locale, `./${folder}/${locale}/enums/issueHelp`),
        getFile(locale, `./${folder}/${locale}/enums/iucnRedListCategory`),
        getFile(locale, `./${folder}/${locale}/enums/threatStatus`),
        getFile(locale, `./${folder}/${locale}/enums/language`),
        getFile(locale, `./${folder}/${locale}/enums/license`),
        getFile(locale, `./${folder}/${locale}/enums/mediaType`),
        getFile(locale, `./${folder}/${locale}/enums/nameTypeEnum`),
        getFile(locale, `./${folder}/${locale}/enums/nameUsageOrigin`),
        getFile(locale, `./${folder}/${locale}/enums/occurrenceIssue`),
        getFile(locale, `./${folder}/${locale}/enums/originEnum`),
        getFile(locale, `./${folder}/${locale}/enums/projections`),
        getFile(locale, `./${folder}/${locale}/enums/region`),
        getFile(locale, `./${folder}/${locale}/enums/role`),
        getFile(locale, `./${folder}/${locale}/enums/taxonomicStatus`),
        getFile(locale, `./${folder}/${locale}/enums/participationStatus`),
        getFile(locale, `./${folder}/${locale}/enums/taxonRank`),
        getFile(locale, `./${folder}/${locale}/enums/typeStatus`),
        getFile(locale, `./${folder}/${locale}/enums/extension`),
        getFile(locale, `./${folder}/${locale}/enums/error`),
        getFile(locale, `./${folder}/${locale}/enums/datasetType`),
        getFile(locale, `./${folder}/${locale}/components/grscicoll`),
        getFile(locale, `./${folder}/${locale}/components/counts`),
        getFile(locale, `./${folder}/${locale}/components/feedback`),
        getFile(locale, `./${folder}/${locale}/components/filters`),
        getFile(locale, `./${folder}/${locale}/components/galleryBar`),
        getFile(locale, `./${folder}/${locale}/components/nameParser`),
        getFile(locale, `./${folder}/${locale}/components/pagination`),
        getFile(locale, `./${folder}/${locale}/components/footer`),
        getFile(locale, `./${folder}/${locale}/components/filterNames`),
        getFile(locale, `./${folder}/${locale}/components/ocurrenceFieldNames`),
        getFile(locale, `./${folder}/${locale}/components/occurrenceKey`),
        getFile(locale, `./${folder}/${locale}/components/occurrenceSearch`),
        getFile(locale, `./${folder}/${locale}/components/downloadReport`),
        getFile(locale, `./${folder}/${locale}/components/validation`),
        getFile(locale, `./${folder}/${locale}/components/healthDetails`),
        getFile(locale, `./${folder}/${locale}/components/healthSummary`),
        getFile(locale, `./${folder}/${locale}/components/installation`),
        getFile(locale, `./${folder}/${locale}/components/gbifNetwork`),
        getFile(locale, `./${folder}/${locale}/components/network`),
        getFile(locale, `./${folder}/${locale}/components/terms`),
        getFile(locale, `./${folder}/${locale}/components/participationStatus`),
        getFile(locale, `./${folder}/${locale}/components/participant`),
        getFile(locale, `./${folder}/${locale}/components/map`),
        getFile(locale, `./${folder}/${locale}/components/species`),
        getFile(locale, `./${folder}/${locale}/components/speciesSearch`),
        getFile(locale, `./${folder}/${locale}/components/homepage`),
        getFile(locale, `./${folder}/${locale}/components/profile`),
        getFile(locale, `./${folder}/${locale}/components/cms`),
        getFile(locale, `./${folder}/${locale}/components/downloads`),
        getFile(locale, `./${folder}/${locale}/components/directory`),
        getFile(locale, `./${folder}/${locale}/components/contactUs`),
        getFile(locale, `./${folder}/${locale}/components/metrics`),
        getFile(locale, `./${folder}/${locale}/components/resource`),
        getFile(locale, `./${folder}/${locale}/components/resourceSearch`),
        getFile(locale, `./${folder}/${locale}/components/dataset`),
        getFile(locale, `./${folder}/${locale}/components/datasetRegistry`),
        getFile(locale, `./${folder}/${locale}/components/tools`),
        getFile(locale, `./${folder}/${locale}/components/search`),
        getFile(locale, `./${folder}/${locale}/components/publisher`),
        getFile(locale, `./${folder}/${locale}/components/country`),
        getFile(locale, `./${folder}/${locale}/components/trends`),
        getFile(locale, `./${folder}/${locale}/components/eoi`),
        getFile(locale, `./${folder}/${locale}/components/intervals`),
        getFile(locale, `./${folder}/${locale}/components/phrases`)
    );
    if (!keepEmptyStrings) {
        removeEmptyStrings(translations);
    }
    return translations;
}


function removeEmptyStrings(obj) {
    _.each(obj, (val, key) => {
        if (typeof val === 'string' && val === '') {
            delete obj[key];
        } else if (typeof (val) === 'object') {
            removeEmptyStrings(obj[key]);
        }
    });
    return obj;
}
