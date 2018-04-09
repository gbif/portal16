'use strict';
let config = require('./config'),
    i18n = require('i18n');

i18n.configure({
    locales: config.locales,
    defaultLocale: config.defaultLocale,
    directory: './locales/_build',
    extension: '.json',
    objectNotation: true,
    fallbacks: {'da': 'en'},
    updateFiles: false,
    // setting of log level WARN - default to require('debug')('i18n:warn')
    logWarnFn: function(msg) {
        console.log('warn', msg);
    },
    // setting of log level ERROR - default to require('debug')('i18n:error')
    logErrorFn: function(msg) {
        console.log('error', msg);
    }
});

module.exports = i18n;

