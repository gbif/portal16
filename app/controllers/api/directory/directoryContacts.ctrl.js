'use strict';
var express = require('express'),
    router = express.Router(),
    directory = require('../../../models/gbifdata/directory/directory'),
    log = require('../../../../config/log');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/directory/contacts', function (req, res, next) {
    directory.getContacts()
        .then(function (data) {
            // insert countryName if missing
            data.peopleByParticipants.forEach(function(p){
                p.people.forEach(function(person){
                    if (!person.hasOwnProperty('countryName')) person.countryName = res.__('country.' + person.participantCountry);
                });
            });

            res.json(data);
        })
        .catch(function (err) {
            log.error('Error in /api/directory/contacts controller: ' + err.message);
            next(err)
        });
});