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
    directory.getSecretariat(req.__)
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
    directory.participantSearch(req.query, req.__)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /directory/participant controller: ' + err.message);
            res.status(err.statusCode || 500);
            res.send('Failed to get participants');
        });
});

router.get('/directory/participantPeople', function(req, res) {
    directory.participantPeopleSearch(req.query)
        .then(data => {
            //add server translation of role for better sorting client side
            data.forEach(function (p) {
                if (p.role) p._role = req.__('role.' + p.role);
                if (p.participant_type == 'COUNTRY') {
                    p.participant = req.__('country.' + p.participant_countryCode);
                } else {
                    p.participant_countryName = req.__('country.' + p.participant_countryCode);
                }
            });
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /directory/participantPeople controller: ' + err.message);
            res.status(err.statusCode || 500);
            res.send('Failed to get participants');
        });
});

router.get('/directory/person', function(req, res) {
    directory.personSearch(req.query, req.__)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /directory/person controller: ' + err.message);
            res.status(err.statusCode || 500);
            res.send('Failed to get people');
        });
});

router.get('/directory/person/:id', function(req, res) {
    directory.person(req.params.id)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /directory/person controller: ' + err.message);
            res.status(err.statusCode || 500);
            res.send('Failed to get people');
        });
});