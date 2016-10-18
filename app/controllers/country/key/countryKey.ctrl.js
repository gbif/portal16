var express = require('express'),
    Country = require('../../../models/gbifdata/gbifdata').Country,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/country/:key\.:ext?', function (req, res, next) {
    var key = req.params.key;
    Country.get(key, {expand: []}).then(function (country) {
        renderPage(req, res, next, country);
    }, function (err) {
        next(err);
    });
});

function renderPage(req, res, next, country) {
    try {
        if (req.params.ext == 'debug') {
            res.json(country);
        } else {
            res.render('pages/country/key/countryKey', {
                country: country,
                _meta: {
                    title: country.record.participantTitle
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
