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

router.get('/country/:iso\.:ext?', function (req, res) {
    res.redirect(302, './' + req.params.iso + '/summary');
});

router.get('/country/:iso/summary\.:ext?', function (req, res, next) {
    helper.renderPage(req, res, next, {_meta: {title: req.__('country.' + req.params.iso)}}, 'pages/participant/country/country');
});

router.get('/country/:iso/about\.:ext?', function (req, res, next) {
    helper.renderPage(req, res, next, {_meta: {title: req.__('country.' + req.params.iso)}}, 'pages/participant/country/country');
});

router.get('/country/:iso/publishing\.:ext?', function (req, res, next) {
    helper.renderPage(req, res, next, {_meta: {title: req.__('country.' + req.params.iso)}}, 'pages/participant/country/country');
});

router.get('/country/:iso/participation\.:ext?', function (req, res, next) {
    helper.renderPage(req, res, next, {_meta: {title: req.__('country.' + req.params.iso)}}, 'pages/participant/country/country');
});

router.get('/country/:iso/trends\.:ext?', function (req, res, next) {
    helper.renderPage(req, res, next, {_meta: {title: req.__('country.' + req.params.iso)}}, 'pages/participant/country/country');
});

router.get('/api/template/country/:iso\.:ext?', function (req, res, next) {
    let isoCode = req.params.iso.toUpperCase();
    let country = getCountry(isoCode, res.locals.gb.locales.current);
    country
        .then(function (context) {
            helper.renderPage(req, res, next, context, 'pages/participant/country/participation/about');
        })
        .catch(function (err) {
            next();
        });
});

router.get('/api/country/about/:iso', function (req, res) {
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
    try {
        participant = await Participant.get(isoCode, current);
        participant = participantView(participant);
        participant._meta = {
            title: 'Country'
        };
        return participant;
    } catch (err) {
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