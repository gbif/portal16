'use strict';

let express = require('express'),
    _ = require('lodash'),
    router = express.Router(),
    config = rootRequire('config/config'),
    localeConfig = rootRequire('config/locales');

// add the local names of the supported locales
let translations = require('../api/translations/translations');
let localNameMap = {};
localeConfig.locales.forEach(function(e) {
    localNameMap[e] = translations[e].language[localeConfig.localeMappings.translation[e]];
});

let unLanguages = ['en', 'ar', 'zh', 'fr', 'ru', 'es'];
let environment = {
    env: config.env,
    productionSite: config.productionSite,
    managementToolsSite: config.managementToolsSite,
    registry: config.registry,
    dataApiV2: config.dataApiV2,
    dataApi: config.dataApi,
    sourceArchive: config.sourceArchive,
    graphQLApi: config.graphQLApi,
    webUtils: config.webUtils,
    tileApi: config.tileApi,
    basemapTileApi: config.basemapTileApi,
    analyticsImg: config.analyticsImg,
    imageCache: config.dataApi + 'image/unsafe/',
    customImageCache: config.dataApi + 'image/cache/',
    mapCapabilities: config.dataApiV2 + 'map/occurrence/density/capabilities.json',
    domain: config.domain,
    locales: localeConfig.locales,
    unLanguages: unLanguages,
    otherLanguages: _.difference(localeConfig.locales, unLanguages),
    localeMappings: {
        moment: localeConfig.localeMappings.moment,
        jsLocale: localeConfig.localeMappings.jsLocale,
        translation: localeConfig.localeMappings.translation,
        numbers: localeConfig.localeMappings.numbers,
        rtl: localeConfig.localeMappings.rtl,
        vocabulary: localeConfig.localeMappings.vocabulary,
        localNames: localNameMap
    }
};

let constantKeys = config.publicConstantKeys;

module.exports = function(app) {
    app.use('/js', router);
};

router.get('/environment.js', function(req, res) {
    res.set('Content-Type', 'application/javascript');
    res.send('window.gb.env = ' + JSON.stringify(environment) + '; window.gb.constantKeys = ' + JSON.stringify(constantKeys));
});
