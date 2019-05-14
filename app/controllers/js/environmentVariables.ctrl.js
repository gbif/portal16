'use strict';

let express = require('express'),
    router = express.Router(),
    config = rootRequire('config/config'),
    localeConfig = rootRequire('config/locales');

// add the local names of the supported locales
let translations = require('../api/translations/translations');
let localNameMap = {};
localeConfig.locales.forEach(function(e) {
    localNameMap[e] = translations[e].language[localeConfig.localeMappings.translation[e]];
});

let environment = {
    managementToolsSite: config.managementToolsSite,
    dataApiV2: config.dataApiV2,
    dataApi: config.dataApi,
    tileApi: config.tileApi,
    basemapTileApi: config.basemapTileApi,
    analyticsImg: config.analyticsImg,
    imageCache: config.dataApi + 'image/unsafe/',
    mapCapabilities: config.dataApiV2 + 'map/occurrence/density/capabilities.json',
    domain: config.domain,
    locales: localeConfig.locales,
    localeMappings: {
        moment: localeConfig.localeMappings.moment,
        jsLocale: localeConfig.localeMappings.jsLocale,
        translation: localeConfig.localeMappings.translation,
        numbers: localeConfig.localeMappings.numbers,
        rtl: localeConfig.localeMappings.rtl,
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
