"use strict";
let express = require('express'),
    router = express.Router(),
    getGeoIp = rootRequire('app/helpers/utils').getGeoIp;

module.exports = function (app) {
    app.use('/api/utils', router);
};

router.get('/geoip', function (req, res) {
    let ip = req.clientIp,
        country = getGeoIp(ip);
    res.json({country: country});
});
