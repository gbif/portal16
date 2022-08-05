'use strict';
const express = require('express'),
    router = express.Router(),
    TheGbifNetwork = require('../../../models/gbifdata/theGbifNetwork/theGbifNetwork'),
    log = require('../../../../config/log');

module.exports = (app) => {
    app.use('/api', router);
};

router.get('/country/digest/:iso2?', (req, res, next) => {
    let iso2;
    if (req.params.hasOwnProperty('iso2') && req.params.iso2 !== undefined) {
        iso2 = req.params.iso2.toUpperCase();
    }
    TheGbifNetwork.getCountries(iso2)
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            log.error('Error in /api/country/digest controller: ' + err.message);
            next(err);
        });
});
