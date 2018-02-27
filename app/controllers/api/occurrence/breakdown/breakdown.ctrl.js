'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    breakdown = require('./breakdown'),
    log = require('../../../../../config/log');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/occurrence/breakdown', function(req, res) {
    let query = breakdown.parseQuery(req.query);
    breakdown.query(query)
        .then(function(response) {
            res.send(response);
        })
        .catch(function(err) {
            res.status(500);
            res.send(err.message);
        });
});
