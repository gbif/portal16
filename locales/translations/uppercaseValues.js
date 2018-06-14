'use strict';

let _ = require('lodash');
let fs = require('fs');
let path = require('path');

const mapValuesDeep = (v, callback) => (
    _.isObject(v)
        ? _.mapValues(v, (v) => mapValuesDeep(v, callback))
        : callback(v)
);

function toUpper(locale, file) {
    if (locale === 'en' || fs.existsSync(path.join(__dirname, `${file}.json`))) {
        let translations = require(file);
        translations = mapValuesDeep(translations, function(o) {
            return _.upperFirst(o);
        });
        // console.log(path.join(__dirname, 'test', `${file}.json`));
        fs.writeFile(path.join(__dirname, 'test', `${file}.json`), JSON.stringify(translations, null, 2), 'utf8', function(err) {
            if (err) throw err;
        });
    } else {
        console.log(`!Attention: Translation file ${file}.json not found.`);
    }
}

function builder() {
    let locale = 'en';
    toUpper(locale, `./${locale}/enums/basisOfRecord`);
    toUpper(locale, `./${locale}/enums/cms`);
    toUpper(locale, `./${locale}/enums/continent`);
    toUpper(locale, `./${locale}/enums/country`);
    toUpper(locale, `./${locale}/enums/downloadFormat`);
    toUpper(locale, `./${locale}/enums/endpointType`);
    toUpper(locale, `./${locale}/enums/establishmentMeans`);
    toUpper(locale, `./${locale}/enums/filterNames`);
    toUpper(locale, `./${locale}/enums/installationType`);
    toUpper(locale, `./${locale}/enums/integerEnums`);
    toUpper(locale, `./${locale}/enums/issueEnum`);
    toUpper(locale, `./${locale}/enums/issueHelp`);
    toUpper(locale, `./${locale}/enums/iucnStatus`);
    toUpper(locale, `./${locale}/enums/language`);
    toUpper(locale, `./${locale}/enums/license`);
    toUpper(locale, `./${locale}/enums/mediaType`);
    toUpper(locale, `./${locale}/enums/nameTypeEnum`);
    toUpper(locale, `./${locale}/enums/nameUsageOrigin`);
    toUpper(locale, `./${locale}/enums/occurrenceIssue`);
    toUpper(locale, `./${locale}/enums/originEnum`);
    toUpper(locale, `./${locale}/enums/projections`);
    toUpper(locale, `./${locale}/enums/protocol`);
    toUpper(locale, `./${locale}/enums/region`);
    toUpper(locale, `./${locale}/enums/role`);
    toUpper(locale, `./${locale}/enums/statusEnum`);
    toUpper(locale, `./${locale}/enums/taxonomicStatus`);
    toUpper(locale, `./${locale}/enums/taxonRank`);
    toUpper(locale, `./${locale}/enums/typeStatus`);
    toUpper(locale, `./${locale}/enums/extension`);
    toUpper(locale, `./${locale}/components/menu`);
    toUpper(locale, `./${locale}/components/feedback`);
    toUpper(locale, `./${locale}/components/footer`);
    toUpper(locale, `./${locale}/components/occurrenceKey/ocurrenceFieldNames`);
    toUpper(locale, `./${locale}/components/occurrenceKey/occurrenceKey`);
    toUpper(locale, `./${locale}/components/occurrenceSearch`);
    toUpper(locale, `./${locale}/components/downloadReport`);
    toUpper(locale, `./${locale}/components/validation`);
    toUpper(locale, `./${locale}/components/health`);
    toUpper(locale, `./${locale}/components/gbifNetwork`);
    toUpper(locale, `./${locale}/components/network`);
    toUpper(locale, `./${locale}/components/terms`);
    toUpper(locale, `./${locale}/components/map`);
    toUpper(locale, `./${locale}/components/species`);
    toUpper(locale, `./${locale}/components/taxon`);
    toUpper(locale, `./${locale}/components/profile`);
    toUpper(locale, `./${locale}/components/cms/cms`);
    toUpper(locale, `./${locale}/components/downloads`);
    toUpper(locale, `./${locale}/components/directory`);
    toUpper(locale, `./${locale}/components/contactUs`);
    toUpper(locale, `./${locale}/components/metrics`);
    toUpper(locale, `./${locale}/components/resource`);
    toUpper(locale, `./${locale}/components/dataset`);
    toUpper(locale, `./${locale}/components/search`);
    toUpper(locale, `./${locale}/components/publisher`);
    toUpper(locale, `./${locale}/components/country`);
    toUpper(locale, `./${locale}/components/trends`);
    toUpper(locale, `./${locale}/components/eoi`);
    toUpper(locale, `./${locale}/intervals`);
    toUpper(locale, `./${locale}/misc`);
    toUpper(locale, `./${locale}/doNotTranslate`);
}

builder();