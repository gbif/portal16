'use strict';

const express = require('express'),
      router = express.Router(),
      Directory = require('../../../models/gbifdata/directory/directory'),
      log = require('../../../../config/log');

module.exports = app => {
    app.use('/api', router);
};

router.get('/directory/contacts', (req, res, next) => {
    Directory.getContacts(res)
        .then(data => {
            Directory.applyTranslation(data, res.__);
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /api/directory/contacts controller: ' + err.message);
            next(err)
        });
});

router.get('/directory/nsg/contacts', (req, res, next) => {
    let contacts = {
        'participants': [],
        'committees': [],
        'gbif_secretariat': [],
        'peopleByParticipants': [],
        'people': []
    };
    Directory.getCommitteeContacts('nodes_steering_group', contacts)
        .then(data => {
            let obj = {
                'members': data
            };
            contacts.committees.push(obj);
            Directory.applyTranslation(contacts, res.__);
            res.json(contacts.committees[0].members);
        })
        .catch(err => {
            log.error('Error in /api/directory/nsg/contacts controller: ' + err.message);
            next(err)
        });
});
