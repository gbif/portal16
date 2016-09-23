var areIntlLocalesSupported = require('intl-locales-supported');

function setSupportedLocales(supportedLocales) {
    if (global.Intl) {
        // Determine if the built-in `Intl` has the locale data we need.
        if (!areIntlLocalesSupported(supportedLocales)) {
            // `Intl` exists, but it doesn't have the data we need, so load the
            // polyfill and replace the constructors we need with the polyfill's.
            var IntlPolyfill = require('intl');
            global.Intl.NumberFormat = IntlPolyfill.NumberFormat;
            global.Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
        }
    } else {
        // No `Intl`, so use and load the polyfill.
        global.Intl = require('intl');
    }
}

module.exports = {
    setSupportedLocales: setSupportedLocales
}