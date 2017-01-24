'use strict';
const express = require('express'),
    router = express.Router(),
    Directory = require('../../../models/gbifdata/directory/directory'),
    log = require('../../../../config/log');

module.exports = app => {
    app.use('/api', router);
};

router.get('/participant/heads/:participantId?', (req, res, next) => {
    Directory.getParticipantHeads(req.params.participantId)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /api/participant/heads controller: ' + err.message);
            next(err)
        });
});
