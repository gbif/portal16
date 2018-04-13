let env = process.env.NODE_ENV || 'local';
// locales = ['en' , 'es', 'da', 'en-IN', 'zh-Hant-TW'],
let locales = ['en'];
if (env === 'staging' || env === 'local') {
    locales.push('de-CH');
    locales.push('da');
    locales.push('mock-EU');
    locales.push('mock-ASIA');
}
let contentfulLocaleMap = {
    'en': 'en-GB',
    'es': 'es',
    'ar': 'ar',
    'zh-hant-TW': 'zh',
    'fr': 'fr',
    'ru': 'ru',
    'pt': 'pt'
};
let momentMap = {
    'en': 'en'
};
if (env === 'staging' || env === 'local') {
    momentMap['mock-EU'] = '';
    momentMap['mock-ASIA'] = '';
}
let defaultLocale = 'en';

module.exports = {
    locales: locales,
    defaultLocale: defaultLocale,
    localeMappings: {
        contentful: contentfulLocaleMap,
        moment: momentMap
    }
};
