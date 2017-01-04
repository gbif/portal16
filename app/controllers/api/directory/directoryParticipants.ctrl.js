'use strict';
let express = require('express'),
    router = express.Router(),
    DirectoryParticipants = require('../../../models/gbifdata/directory/directoryParticipants'),
    log = require('../../../../config/log');

module.exports = app => {
    app.use('/api', router);
};

router.get('/directory/participants', (req, res, next) => {
    DirectoryParticipants.groupBy(req.query)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /api/directory/participants controller: ' + err.message);
            next(err)
        });
});