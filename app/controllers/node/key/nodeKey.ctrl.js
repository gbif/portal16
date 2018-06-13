'use strict';

let express = require('express'),
    utils = rootRequire('app/helpers/utils'),
// apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    helper = rootRequire('app/models/util/util'),
    _ = require('lodash'),
// contributors = require('../../dataset/key/contributors/contributors'),
    router = express.Router();

module.exports = function(app) {
    app.use('/', router);
};

let Participant = rootRequire('app/models/node/participant'),
    Node = rootRequire('app/models/node/node'),
    countries = rootRequire('app/models/enums/basic/country'),
    countryMap = _.keyBy(countries, _.identity),
    participantView = require('./viewModel');

router.get('/node/:key.:ext?', function(req, res, next) {
        let key = req.params.key;
        if (!utils.isGuid(key) || key == '02c40d2a-1cba-4633-90b7-e36e5e97aba8') {
            next();
            return;
        }
        let node = Node.get(key, res.locals.gb.locales.current);

        node.then(function(n) {
            let firstDirectoryIdentifier = _.find(n.identifiers, {type: 'GBIF_PARTICIPANT'});
            if (n.type == 'COUNTRY') {
                // if country then redirect to proper url
                res.redirect(302, res.locals.gb.locales.urlPrefix + '/country/' + n.country);
                return;
            } else if (firstDirectoryIdentifier) {
                // if participant then redirect to proper url
                res.redirect(302, res.locals.gb.locales.urlPrefix + '/participant/' + firstDirectoryIdentifier.identifier);
                return;
            } else {
                n._meta = {
                    title: n.title
                };
                helper.renderPage(req, res, next, n, 'pages/node/key/seo');
            }
        }).catch(function(err) {
            next(err);
        });
});

router.get('/participant/:key(\\d+).:ext?', function(req, res, next) {
        let key = req.params.key;
        let participant = Participant.get(key);

        participant.then(function(p) {
            if (p.participant.type == 'COUNTRY') {
                res.redirect(302, res.locals.gb.locales.urlPrefix + '/country/' + p.participant.countryCode);
                return;
            }
            p = participantView(p);
            p._meta = {
                title: p.participant.name,
                description: res.__mf('participationStatus.type.OTHER.description.' + p.participant.participationStatus, {REGION: res.__('region.' + p.participant.gbifRegion)})
            };
            helper.renderPage(req, res, next, p, 'pages/participant/participant/seo');
        }).catch(function(err) {
            next(err);
        });
});

router.get('/api/participant/:key(\\d+)', function(req, res) {
    let key = req.params.key;
    let participant = Participant.get(key);

    participant
        .then(function(p) {
            p = participantView(p);
            res.json(p);
        })
        .catch(function(err) {
            res.status(err.statusCode || 500);
            res.send('failed to get participant data');
        });
});


router.get('/country/:iso.:ext?', function(req, res) {
    res.redirect(302, './' + req.params.iso + '/summary');
});
router.get('/country/:iso/summary.:ext?', renderCountry);
router.get('/country/:iso/about.:ext?', renderCountry);
router.get('/country/:iso/publishing.:ext?', renderCountry);
router.get('/country/:iso/participation.:ext?', renderCountry);
router.get('/country/:iso/publications.:ext?', renderCountry);

function renderCountry(req, res, next) {
    let isoCode = req.params.iso.toUpperCase();
    if (!countryMap[isoCode]) {
        next();
    } else if (isoCode !== req.params.iso) {
        res.redirect(302, res.locals.gb.locales.urlPrefix + '/country/' + isoCode + '/summary');
    } else {
        getCountry(isoCode, res.locals.gb.locales.current)
            .then(function(context) {
                context._meta.canonicalUrl = res.locals.gb.locales.urlPrefix + '/country/' + isoCode + '/summary';
                context._meta.title = res.__('country.' + isoCode);
                if (_.has(context, 'participant.participationStatus')) {
                    context._meta.description = res.__mf(
                        'participationStatus.description.' + context.participant.participationStatus,
                        {REGION: res.__('region.' + context.participant.gbifRegion)}
                    );
                }
                helper.renderPage(req, res, next, context, 'pages/participant/country/country');
            })
            .catch(function(err) {
                if (err.statusCode == 404) {
                    next();
                }
                next(err);
            });
    }
}

router.get('/api/template/country/:iso.:ext?', function(req, res, next) {
    let isoCode = req.params.iso.toUpperCase();
    let country = getCountry(isoCode, res.locals.gb.locales.current);
    country
        .then(function(context) {
            helper.renderPage(req, res, next, context, 'pages/participant/country/participation/about');
        })
        .catch(function() {
            next();
        });
});

router.get('/api/country/:iso', function(req, res) {
    let isoCode = req.params.iso.toUpperCase();
    let country = getCountry(isoCode, res.locals.gb.locales.current);
    country
        .then(function(context) {
            res.json(context);
        })
        .catch(function(err) {
            res.status(err.statusCode || 500);
            res.send('Failed to get country data');
        });
});

async function getCountry(isoCode, currentLocale) {
    if (!countryMap[isoCode]) {
        throw {
            statusCode: 404,
            message: 'Not a known country code'
        };
    }
    let participant;
    try {
        participant = await Participant.get(isoCode, currentLocale);
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
                title: isoCode
            };
            return nonParticipant;
        }
    }
}
