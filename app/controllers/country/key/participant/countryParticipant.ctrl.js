"use strict";
var express = require('express'),
    Country = rootRequire('app/models/gbifdata/gbifdata').Country,
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/country/:key/participant\.:ext?', function (req, res, next) {
    var key = req.params.key;

    Country.get(key, {expand: ['participant']}).then(function (country) {
        if (!country.participant) {
            next();
            return;
        }
        try {
            renderPage(req, res, next, country);
        } catch (err) {
            next(err)
        }
    }, function (err) {
        next(err);
    });
});


function renderPage(req, res, next, country) {
    try {
        if (req.params.ext == 'debug') {
            res.json(country);
        } else {
            res.render('pages/country/key/participant/countryParticipant', {
                country: country,
                _meta: {
                    title: country.record.participantTitle,
                    imageCacheUrl: imageCacheUrl
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
