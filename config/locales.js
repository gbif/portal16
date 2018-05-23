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

let contentfulLocaleMap = _.keyBy(locales);
// overwrites
contentfulLocaleMap['en'] = 'en-GB';
contentfulLocaleMap['es'] = 'es';
contentfulLocaleMap['ar'] = 'ar';
contentfulLocaleMap['fr'] = 'fr';
contentfulLocaleMap['ru'] = 'ru';
contentfulLocaleMap['pt'] = 'pt';
contentfulLocaleMap['zh-hant-TW'] = 'zh';

let momentMap = _.keyBy(locales);
// overwrites
momentMap['de-CH'] = 'de-ch';
momentMap['zh'] = 'zh-cn';
if (env === 'staging' || env === 'local') {
    momentMap['mock-EU'] = '';
    momentMap['mock-ASIA'] = '';
    momentMap['zh'] = 'zh-cn';
}

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
