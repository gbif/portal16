'use strict';
const express = require('express'),
      router = express.Router(),
      //apicache = require('apicache'),
      DirectoryParticipants = require('../../../models/gbifdata/directory/directoryParticipants'),
      _ = require('lodash'),
      log = require('../../../../config/log'),
      membershipTypeToShow = ['voting_participant', 'associate_country_participant', 'other_associate_participant'];

//let cache = apicache.middleware;

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

// param membershipType is not allowed here.
router.get('/directory/participants/count', (req, res, next) => {
    DirectoryParticipants.groupBy(req.query)
        .then(results => {
            let participantsByMembership;
            participantsByMembership = _.groupBy(results, p => {
                return (p.hasOwnProperty('membershipType')) ? p.membershipType : 'NOT_SPECIFIED';
            });
            let count = {};
            count.region = req.query.gbifRegion;
            membershipTypeToShow.forEach(type => {
                count[type] = participantsByMembership[type].length;
            });
            res.json(count);
        })
        .catch(err => {
            log.error('Error in /api/directory/participants controller: ' + err.message);
            next(err)
        });
});


/*
// Utility code to get country iso2 in a file.
router.get('/country-enumeration', (req, res, next) => {
    helper.getApiDataPromise('http://api.gbif.org/v1/enumeration/country', {})
        .then(result => {
            let file = fs.createWriteStream('/tmp/countries.txt');
            file.on('error', err => { console.log(err)});
            result.forEach(country => { file.write(country.iso2 + '\n')});
            file.end();
        })
        .catch(e => {
            console.log(e);
        });
});

 //let  helper = require('../../../models/util/util'),
 //     dataApi = require('../../../models/gbifdata/apiConfig'),
 //     fs = require('fs'),
 //     jsonexport = require('jsonexport');
 // utility code to generate CSV list of countries by region.
router.get('/directory/non-participants', (req, res, next) => {
    let regions = ['AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA'];
    regions.forEach(region => {
        DirectoryParticipants.groupBy({'gbifRegion': region})
            .then(data => {
                jsonexport(data, {}, (err, csv) => {
                    if (err) return new Error(err.message);
                    return fs.writeFile('/tmp/participants-' + region + '.csv', csv, (err) => {
                        if (err) throw err;
                    })
                });
            })

    });


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