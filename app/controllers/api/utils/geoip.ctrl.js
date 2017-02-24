"use strict";
let express = require('express'),
    router = express.Router(),
    log = rootRequire('config/log'),
    minute = 60000,
    hour =  60*minute,
    _ = require('lodash'),
    getGeoIp = rootRequire('app/helpers/utils').getGeoIp;

module.exports = function (app) {
    app.use('/api/utils', router);
};

router.get('/geoip', function (req, res) {
    let ip = req.clientIp,
        country = getGeoIp(ip);
    if (!country) {
        log.error('unable to match ip to country using ip: ' + ip);
        res.setHeader('Cache-Control', 'no-cache');
        res.status(404);
        res.send();
    } else {
        res.setHeader('Cache-Control', 'private, max-age=' + hour);
        res.json({country: country});
    }
});

router.get('/geoip/country', function (req, res) {
    let ip = req.clientIp,
        country = getGeoIp(ip),
        countryCode = _.get(country, 'country.iso_code');

    if (!countryCode) {
        log.error('unable to match ip to country using ip: ' + ip);
        res.setHeader('Cache-Control', 'no-cache');
        res.status(404);
        res.send();
    } else {
        res.setHeader('Cache-Control', 'private, max-age=' + hour);
        res.send(countryCode);
    }
});
