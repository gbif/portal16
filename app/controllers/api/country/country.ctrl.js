'use strict';
const express = require('express'),
    router = express.Router(),
    TheGbifNetwork = require('../../../models/gbifdata/theGbifNetwork/theGbifNetwork'),
    log = require('../../../../config/log');

module.exports = app => {
    app.use('/api', router);
};

router.get('/country/digest/:iso2?', (req, res, next) => {
    TheGbifNetwork.getCountries(req.params.iso2)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /api/country/digest controller: ' + err.message);
            next(err)
        });
});
