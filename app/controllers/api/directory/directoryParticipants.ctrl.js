'use strict';
let express = require('express'),
    router = express.Router(),
    //jsonexport = require('jsonexport'),
    fs = require('fs'),
    helper = require('../../../models/util/util'),
    dataApi = require('../../../models/gbifdata/apiConfig'),
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

/*
router.get('/directory/non-participants', (req, res, next) => {
    DirectoryParticipants.groupBy()
        .then(data => {
            let options = {};
            return helper.getApiDataPromise(dataApi.countryEnumeration.url, options)
                .then(results => {
                    let nonParticipants = results.filter(result => {
                        let inArray = data.findIndex(p => {
                            return p.countryCode == result.iso2;
                        });
                        return inArray === -1;
                    });
                    let exportOptions = {
                    };
                    //nonParticipants = JSON.stringify(nonParticipants);
                    //nonParticipants = JSON.parse(nonParticipants);
                    jsonexport(nonParticipants, exportOptions, (err, csv) => {
                        if (err) return new Error(err.message);
                        return fs.writeFile('/tmp/non-participants.csv', csv, (err) => {
                            if (err) throw err;
                            var message = 'Members retrieved and saved.';
                            console.info(message);
                            res.json({message: message});
                            process.exit(0);
                        });
                    });
                });
        })
        .catch(err => {
            log.error('Error in /api/directory/participants controller: ' + err.message);
            next(err)
        });
});
*/