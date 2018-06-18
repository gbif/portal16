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
    locales.push('de-CH');
    locales.push('da');
    locales.push('zh');
    locales.push('es');
    locales.push('mock-EU');
    locales.push('mock-ASIA');
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

// Moment occasionally use other names for the languages. Provide them here
let momentMap = _.keyBy(locales); // default to use the same language codes

// overwrites specific that differs
momentMap['de-CH'] = 'zh-cn';
momentMap['zh'] = 'zh-cn';
if (env === 'staging' || env === 'local') {
    momentMap['mock-EU'] = '';
    momentMap['mock-ASIA'] = '';
    momentMap['zh'] = 'zh-cn';
}

// If the toLolaeString is using a different format, then provide it. This isn't used much on the site yet, so make sure the places you are using it works as intended
let jsLocaleMap = _.keyBy(locales);

module.exports = {
    locales: locales,
    defaultLocale: defaultLocale,
    localeMappings: {
        contentful: contentfulLocaleMap,
        moment: momentMap,
        jsLocale: jsLocaleMap
    }
};
