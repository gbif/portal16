"use strict";
var express = require('express'),
    router = express.Router(),
    config = rootRequire('config/config');
    
let environment = {
    dataApiV2: config.dataApiV2,
    dataApi: config.dataApi,
    tileApi: config.tileApi,
    basemapTileApi: config.basemapTileApi,
    analyticsImg: config.analyticsImg,
    imageCache: config.dataApi + 'image/unsafe/',
    mapCapabilities: config.dataApiV2 + 'map/occurrence/density/capabilities.json'
};

let constantKeys = config.publicConstantKeys;

module.exports = function (app) {
    app.use('/js', router);
};

router.get('/environment.js', function (req, res) {
    res.set('Content-Type', 'application/javascript');
    res.send('window.gb.env = ' + JSON.stringify(environment) + '; window.gb.constantKeys = ' + JSON.stringify(constantKeys));
});