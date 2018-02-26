'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    breakdown = require('./breakdown');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/occurrence/breakdown', function(req, res) {
    res.send('not implemented');
});