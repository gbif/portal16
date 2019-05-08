/**
 Express middleware
 Extracts the language from url and attaches it on the response so it is available in templates and elsewhere down stream.
 It also sets the locale of the i18n framework for handling translations.
 */

let localeConfig = rootRequire('config/locales');

// Given a list of possible locales it detects if it is in a given URL. returns the locale or undefined if not present.
// e.g. getLocaleFromUrl('/da/blogposts/123', ['da', 'en']) -> 'da'
// e.g. getLocaleFromUrl('/da/blogposts/123', ['es', 'en']) -> undefined
function getLocaleFromUrl(url, locales) {
    if (url == '') {
        return false;
    }
    let first = url.substring(1).split('/');
    let matchedIndex = locales.indexOf(first[0]);
    if (matchedIndex != -1) {
        return locales[matchedIndex];
    }
    return undefined;
}

// remove locale from url. e.g. removeLocaleFromUrl('/en/blogpost/123', 'en') -> '/blogpost/123'
function removeLocaleFromUrl(url, locale) {
    // eslint-disable-next-line no-useless-escape
    let expr = '(^' + locale + '\/)|(^' + locale + '$)';
    let regex = new RegExp(expr);
    let strippedUrl = '/' + url.substring(1).replace(regex, '');
    return strippedUrl;
}

// remove locale from url so that different locales use the same routes. attach locale to response.
function use(app, locales, defaultLocale) {
    // Use middleware to set current language based on url
    app.use(function(req, res, next) {
        let locale = getLocaleFromUrl(req.url, locales);
        let queryLocale = req.query.locale || req.query.lang;

        res.locals.gb = res.locals.gb || {};

        if (locale) {
            req.url = removeLocaleFromUrl(req.url, locale);
            req.setLocale(locale);
            res.locals.gb.locales = {
                urlPrefix: '/' + locale,
                current: locale,
                locales: locales,
                config: localeConfig,
                rtl: localeConfig.localeMappings.rtl[locale]
            };
        } else if (typeof queryLocale !== 'undefined' && queryLocale != defaultLocale && locales.indexOf(queryLocale) > -1) {
            req.setLocale(queryLocale);
            res.locals.gb.locales = {
                urlPrefix: '/' + queryLocale,
                current: queryLocale,
                locales: locales,
                config: localeConfig,
                rtl: localeConfig.localeMappings.rtl[queryLocale]
            };
        } else {
            req.setLocale(defaultLocale); // remove to use browser preference
            res.locals.gb.locales = {
                urlPrefix: '',
                current: defaultLocale,
                locales: locales,
                config: localeConfig,
                rtl: localeConfig.localeMappings.rtl[defaultLocale]
            };
        }
        // console.log();
        next();
    });
}

module.exports = {
    use: use,
    getLocaleFromUrl: getLocaleFromUrl,
    removeLocaleFromUrl: removeLocaleFromUrl
};

