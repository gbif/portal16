'use strict';
const express = require('express'),
    router = express.Router(),
    Q = require('q'),
    moment = require('moment'),
    Directory = require('../../../models/gbifdata/directory/directory'),
    DirectoryParticipants = require('../../../models/gbifdata/directory/directoryParticipants'),
    TheGbifNetwork = require('../../../models/gbifdata/theGbifNetwork/theGbifNetwork'),
    helper = require('../../../models/util/util'),
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

router.get('/participants/digest', (req, res, next) => {
    let url = 'http://' + req.get('host') + '/api/directory/participants/active',
        query = req.query,
        participants = [];

    // @todo decide whether it's necessary to calculate for GLOBAL.
    if (query.gbifRegion === 'GLOBAL' || typeof query.gbifRegion === 'undefined') {
        res.json(participants);
    }
    else {
        helper.getApiDataPromise(url, {'qs': query})
            .then(data => {
                data.forEach(datum => {
                    datum.iso2 = datum.countryCode;
                });
                let tasks = [];

                data.forEach(country => {
                    if (country.type === 'COUNTRY') {
                        tasks.push(TheGbifNetwork.getDataCount(country)
                            .then(country => {
                                return country;
                            })
                            .catch(e => {
                                log.info(e + ' at getDataCount().');
                            }));
                    }
                    else {
                        participants.push(country);
                    }
                });

                return Q.all(tasks)
                    .then(digestedParticipants => {
                        return digestedParticipants;
                    })
            })
            .then(digestedParticipants => {
                participants = participants.concat(digestedParticipants);
                participants.forEach(p => {
                    p.memberSince = moment(p.membershipStart, 'MMMM YYYY').format('YYYY');
                });

                // sort by membershipType, then name.
                participants.sort((a, b) => {
                    if (a.name < b.name) {
                        return -1;
                    }
                    else if (a.name > b.name) {
                        return 1;
                    }
                });
                res.json(participants);
            })
            .catch(err => {
                log.error('Error in /api/participants/digest controller: ' + err.message);
                next(err)
            });
    }
});
