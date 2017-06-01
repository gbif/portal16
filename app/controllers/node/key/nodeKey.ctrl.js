"use strict";

var express = require('express'),
    utils = rootRequire('app/helpers/utils'),
    //apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    helper = rootRequire('app/models/util/util'),
    _ = require('lodash'),
    //contributors = require('../../dataset/key/contributors/contributors'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

let Participant = rootRequire('app/models/node/participant'),
    Node = rootRequire('app/models/node/node'),
    countries = rootRequire('app/models/util/country-codes'),
    countryMap = _.keyBy(_.filter(countries, 'ISO3166-1-Alpha-2'), 'ISO3166-1-Alpha-2'),
    participantView = require('./viewModel');

router.get('/node/:key\.:ext?', function (req, res, next) {
    try {
        let key = req.params.key;
        if (!utils.isGuid(key)) {
            next();
            return;
        }
        let node = Node.get(key, res.locals.gb.locales.current);

        node
            .then(function (participant) {
                if (participant.participant.type == 'COUNTRY') {
                    res.redirect(302, res.locals.gb.locales.urlPrefix + '/country/' + participant.participant.countryCode);
                    return;
                }
                participant = participantView(participant);
                participant._meta = {
                    title: 'Node',
                    customUiView: true
                };
                helper.renderPage(req, res, next, participant, 'pages/participant/participant/participantKey');
            })
            .catch(function (err) {
                next(err);
            });
    } catch (err) {
        next(err);
    }
});

router.get('/country/:iso\.:ext?', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/participant/country/country');
});

router.get('/country/:iso/trends\.:ext?', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/participant/country/country');
});

router.get('/country/:iso/activity\.:ext?', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/participant/country/country');
});

router.get('/api/template/country/:iso\.:ext?', function (req, res, next) {
    // helper.renderPage(req, res, next, {}, 'pages/participant/country/country');
    // return;
    let isoCode = req.params.iso.toUpperCase();
    let country = getCountry(isoCode, res.locals.gb.locales.current);
    country
        .then(function (context) {
            helper.renderPage(req, res, next, context, 'pages/participant/country/countryKey');
        })
        .catch(function (err) {
            next(err);
        });
});

router.get('/api/country/about/:iso', function (req, res, next) {
    let isoCode = req.params.iso.toUpperCase();
    let country = getCountry(isoCode, res.locals.gb.locales.current);
    country
        .then(function (context) {
            res.json(context);
        })
        .catch(function () {
            res.status(500);
            res.send('Failed to get country data');
        });
});

async function getCountry(isoCode, current) {
    if (!countryMap[isoCode]) {
        throw {
            statusCode: 404,
            message: 'Not a known country code'
        }
    }
    let participant;
    try{

        //TODO remove tmp look up approach shortly after 1 june 2017
        //ugly patch until the directory API supports search by countryCode. currently it filters out IN because it is an english word and you can only search by freetext. This should be fixed at API level
        let tmp = isoCode;
        if (isoCode == 'IN') {
            tmp = '114';
        }
        participant = await Participant.get(tmp, current);
        //participant = await Participant.get(isoCode, current);
        participant = participantView(participant);
        participant._meta = {
            title: 'Country'
        };
        return participant;
    } catch(err){
        if (err.statusCode !== 404) {
            throw err;
        } else {
            let nonParticipant = {
                country: {
                    countryCode: isoCode
                }
            };
            nonParticipant._meta = {
                title: countryMap[isoCode].name
            };
            return nonParticipant;
        }
    }
}

// router.get('/api/template/country/about/:iso\.:ext?', function (req, res, next) {
//     let isoCode = req.params.iso.toUpperCase();
//     if (!countryMap[isoCode]) {
//         next();
//         return;
//     }
//     let participantPromise = Participant.get(isoCode, res.locals.gb.locales.current);
//     participantPromise
//         .then(function (participant) {
//             participant = participantView(participant);
//             participant._meta = {
//                 title: 'Country',
//                 customUiView: true
//             };
//             helper.renderPage(req, res, next, participant, 'pages/participant/country/prose');
//         })
//         .catch(function (err) {
//             if (err.statusCode !== 404) {
//                 next(err);
//                 return;
//             } else {
//                 let nonParticipant = {
//                     country: {
//                         countryCode: isoCode
//                     }
//                 };
//                 nonParticipant._meta = {
//                     title: countryMap[isoCode].name,
//                     customUiView: true
//                 };
//                 helper.renderPage(req, res, next, nonParticipant, 'pages/participant/country/prose');
//             }
//         });
// });