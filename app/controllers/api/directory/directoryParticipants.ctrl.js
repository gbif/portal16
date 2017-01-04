'use strict';
var express = require('express'),
    router = express.Router(),
    DirectoryParticipants = require('../../../models/gbifdata/directory/directoryParticipants'),
    log = require('../../../../config/log');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/directory/participants', function (req, res, next) {
    DirectoryParticipants.groupBy(req.query)
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            log.error('Error in /api/directory/participants controller: ' + err.message);
            next(err)
        });
});