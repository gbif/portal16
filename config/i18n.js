"use strict";
let config = require('./config'),
    i18n = require("i18n");

i18n.configure({
    locales: config.locales,
    defaultLocale: config.defaultLocale,
    directory: './locales/server/',
    objectNotation: true,
    fallbacks: {'da': 'en'},
    updateFiles: false
});

module.exports = i18n;
