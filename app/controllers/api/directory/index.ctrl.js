'use strict';

const express = require('express'),
    router = express.Router(),
    directory = require('./directory.model'),
    log = require('../../../../config/log');

module.exports = app => {
    app.use('/api', router);
};

router.get('/directory/committee/:committee', function(req, res) {
    directory.getCommittee(req.params.committee)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /directory/committee controller: ' + err.message);
            res.status(err.statusCode || 500);
            res.send('Failed to get committee');
        });
});

router.get('/directory/secretariat', function(req, res) {
    directory.getSecretariat()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /directory/secretariat controller: ' + err.message);
            res.status(err.statusCode || 500);
            res.send('Failed to get secretariat');
        });
});

router.get('/directory/participant', function(req, res) {
    directory.participantSearch(req.query)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /directory/participant controller: ' + err.message);
            res.status(err.statusCode || 500);
            res.send('Failed to get participants');
        });
});

router.get('/directory/person', function(req, res) {
    directory.personSearch(req.query)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /directory/person controller: ' + err.message);
            res.status(err.statusCode || 500);
            res.send('Failed to get people');
        });
});