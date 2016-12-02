"use strict";
var express = require('express'),
    cfg = rootRequire('config/config'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    _ = require('lodash'),
    countryData = require('./countryData'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/country/:key\.:ext?', function (req, res, next) {
    var key = req.params.key;

    countryData.getCountryData(key, function(err, country){
        if (err) {
            next(err)
        } else {
            country.code = key;
            var latest = _.get(country, 'news.results', []).concat(_.get(country, 'dataUse.results', [])).concat(_.get(country, 'events.results', []));
            country.latest = _.sortBy(latest, ['created']).reverse();
            renderPage(req, res, next, country);
        }
    });
});

router.get('/country/:key/participant\.:ext?', function (req, res, next) {
    var key = req.params.key;

    countryData.getCountryData(key, function(err, country){
        if (err) {
            next(err)
        } else {
            country.code = key;
            var latest = country.news.results.concat(country.dataUse.results).concat(country.events.results);
            country.latest = _.sortBy(latest, ['created']).reverse();
            try {
                if (req.params.ext == 'debug') {
                    res.json(country);
                } else {
                    res.render('pages/country/key/participant/countryParticipant', {
                        country: country,
                        _meta: {
                            title: res.__('country.' + country.code),
                            imageCacheUrl: imageCacheUrl
                        }
                    });
                }
            } catch (e) {
                next(e);
            }
        }
    });
});

router.get('/country/:key/trends/about\.:ext?', function (req, res, next) {
    var key = req.params.key;
    countryData.getCountryData(key, function(err, country){
        if (err) {
            next(err)
        } else {
            country.code = key;
            renderTrendsPage(req, res, next, country, true);
        }
    });
});

router.get('/country/:key/trends/published\.:ext?', function (req, res, next) {
    var key = req.params.key;
    countryData.getCountryData(key, function(err, country){
        if (err) {
            next(err)
        } else {
            country.code = key;
            renderTrendsPage(req, res, next, country, false);
        }
    });
});

function renderTrendsPage(req, res, next, country, isAbout) {
    try {
        if (req.params.ext == 'debug') {
            res.json(country);
        } else {
            res.render('pages/country/key/trends/countryTrends', {
                country: country,
                isAbout,
                imgUrls: {//TODO more or less just copied from Markus' initial implemetation. Not translatable
                    from: {
                        thumbBase: imageCacheUrl + "fit-in/300x250/http://" + cfg.analyticsImg + 'country/' + country.code + '/publishedBy/figure/',
                        imgBase: imageCacheUrl + "http://" + cfg.analyticsImg + 'country/' + country.code + '/publishedBy/figure/'
                    },
                    about: {
                        thumbBase: imageCacheUrl + "fit-in/300x250/http://" + cfg.analyticsImg + 'country/' + country.code + '/about/figure/',
                        imgBase: imageCacheUrl + "http://" + cfg.analyticsImg + 'country/' + country.code + '/about/figure/'
                    }
                },
                _meta: {
                    title: res.__('country.' + country.code),
                    imageCacheUrl: imageCacheUrl
                }
            });
        }
    } catch (e) {
        next(e);
    }
}


function renderPage(req, res, next, country) {
    try {
        if (req.params.ext == 'debug') {
            res.json(country);
        } else {
            res.render('pages/country/key/countryKey', {
                country: country,
                _meta: {
                    title: res.__('country.' + country.code),
                    imageCacheUrl: imageCacheUrl
                }
            });
        }
    } catch (e) {
        next(e);
    }
}