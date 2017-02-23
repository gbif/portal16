"use strict";
let express = require('express'),
    router = express.Router(),
    log = rootRequire('config/log'),
    getGeoIp = rootRequire('app/helpers/utils').getGeoIp;

module.exports = function (app) {
    app.use('/api/utils', router);
};

router.get('/geoip', function (req, res) {
    let ip = req.clientIp,
        country = getGeoIp(ip);
    if (!country) {
        log.error('unable to match ip to country using ip: ' + ip);
    }
    res.json({country: country});
});
