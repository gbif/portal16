var localeMiddleware = require('./localeFromQuery.js');

describe("Language from url middleware", function () {
    it("extracts language from url", function () {
        expect(localeMiddleware.getLocaleFromUrl('/en', ['en', 'da'])).toEqual('en');
        expect(localeMiddleware.getLocaleFromUrl('/da', ['ar', 'da'])).toEqual('da');
        expect(localeMiddleware.getLocaleFromUrl('/se/', ['en', 'se'])).toEqual('se');
        expect(localeMiddleware.getLocaleFromUrl('/ar/ending/dam', ['en', 'ar'])).toEqual('ar');

        expect(localeMiddleware.getLocaleFromUrl('/', ['en', 'da'])).not.toBeDefined();
        expect(localeMiddleware.getLocaleFromUrl('/ending/dam', ['en', 'da'])).not.toBeDefined();
    });

    it("removes language from url", function () {
        expect(localeMiddleware.removeLocaleFromUrl('/en', 'en')).toEqual('/');
        expect(localeMiddleware.removeLocaleFromUrl('/en/', 'en')).toEqual('/');
        expect(localeMiddleware.removeLocaleFromUrl('/da/english', 'da')).toEqual('/english');
        expect(localeMiddleware.removeLocaleFromUrl('/es/species/243', 'es')).toEqual('/species/243');
    });
});
