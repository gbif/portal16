'use strict';
let locales = require('../../../../config/config').locales;
let translations = {};

locales.forEach(function(locale) {
    translations[locale] = require(`../../../../locales/_build/${locale}.json`);
});

module.exports = translations;