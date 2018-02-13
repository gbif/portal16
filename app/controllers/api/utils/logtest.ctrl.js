"use strict";

var express = require('express'),
    router = express.Router(),
    log = require('../../../../config/log');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/log/info', function (req, res) {
    log.info({myField: 'test info logging'}, 'Test logging');
    res.send('done');
});

router.get('/log/warn', function (req, res) {
    log.warn({customField: 'hej', somethingElse: 'med dig'}, 'TEST log warning form test endpoint');
    res.send('done');
});

router.get('/log/error', function (req, res) {
    let err = new Error('error thrown');
    log.info({err: err}, 'error obj');
    res.send('done');
});