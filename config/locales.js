// Different systems use different abbrevations and might support different granularities. So unfortunately some mapping is needed.
// things that can differ: url, contentful, moment, js toLocaleString
// locales: refer to how it will show in the url
// moment: moment js naming https://momentjs.com/
// contentful: the supported name in contentful
// jsLocale: what is it called when calling toLocaleString

let _ = require('lodash');
let env = process.env.NODE_ENV || 'local';
let defaultLocale = 'en';

// locales = ['en' , 'es', 'da', 'en-IN', 'zh-Hant-TW'],
let locales = ['en'];
if (env === 'staging' || env === 'local') {
    locales.push('de-MOCK');
    locales.push('ko-MOCK');
    locales.push('ar-MOCK');
}

// if the locale is something we translate to in contentful, then add the mapping here.
let contentfulLocaleMap = {}; // the contentful map should not handle locales that are not included in our contentful space hence no : _.keyBy(locales);
// overwrites
contentfulLocaleMap['en'] = 'en-GB';
contentfulLocaleMap['es'] = 'es';
contentfulLocaleMap['ar'] = 'ar';
contentfulLocaleMap['fr'] = 'fr';
contentfulLocaleMap['ru'] = 'ru';
contentfulLocaleMap['pt'] = 'pt';
contentfulLocaleMap['zh'] = 'zh';
contentfulLocaleMap['zh-hant-TW'] = 'zh';
// mock test languages
if (env === 'staging' || env === 'local') {
    contentfulLocaleMap['de-MOCK'] = 'es';
    contentfulLocaleMap['ko-MOCK'] = 'zh';
    contentfulLocaleMap['ar-MOCK'] = 'ar';
}

// the translation file is using iso 3 for most languages. but some cannot be represented as such and so longer language codes are also allowed. An example being traditioanl Chinese
let translationMap = {};
// overwrites
translationMap['en'] = 'eng';
translationMap['es'] = 'spa';
translationMap['ar'] = 'ara';
translationMap['fr'] = 'fra';
translationMap['ru'] = 'rus';
translationMap['pt'] = 'por';
translationMap['zh'] = 'zh-hant';
// mock test languages
if (env === 'staging' || env === 'local') {
    translationMap['de-MOCK'] = 'gsw';
    translationMap['ko-MOCK'] = 'kor';
    translationMap['ar-MOCK'] = 'ara';
}

// Moment occasionally use other names for the languages. Provide them here
let momentMap = _.keyBy(locales); // default to use the same language codes

// overwrites specific that differs
momentMap['zh'] = 'zh-cn';
// mock test languages
if (env === 'staging' || env === 'local') {
    momentMap['de-MOCK'] = 'de-ch';
    momentMap['ko-MOCK'] = 'ko';
    momentMap['ar-MOCK'] = 'ar-sa';
}

// what locale to use for numbers
let numberMap = {};// _.keyBy(locales); // default to use the same language codes
// overwrites specific that differs
// numberMap['zh'] = 'zh-cn';
// mock test languages
if (env === 'staging' || env === 'local') {
    numberMap['de-MOCK'] = 'de-ch';
    numberMap['ko-MOCK'] = 'zh-cn';
    numberMap['ar-MOCK'] = 'en';
}

// If the toLolaeString is using a different format, then provide it. This isn't used much on the site yet, so make sure the places you are using it works as intended
let jsLocaleMap = _.keyBy(locales);

module.exports = {
    locales: locales,
    defaultLocale: defaultLocale,
    localeMappings: {
        contentful: contentfulLocaleMap,
        moment: momentMap,
        jsLocale: jsLocaleMap,
        translation: translationMap,
        numbers: numberMap
    }
};
