"use strict";
let maxmind = require('maxmind'),
    express = require('express'),
    log = rootRequire('config/log'),
    router = express.Router(),
    cityLookup = maxmind.openSync(__dirname + '/GeoLite2-Country.mmdb'); //sync startup

module.exports = function (app) {
    app.use('/api/utils', router);
};

router.get('/geoip', function (req, res) {
    let ip = req.clientIp,
        country = cityLookup.get(ip);
    res.json({country: country});
});