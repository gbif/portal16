"use strict";
var express = require('express'),
    Q = require('q'),
    Country = require('../../../models/gbifdata/gbifdata').Country,
    helper = rootRequire('app/models/util/util'),
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    _ = require('lodash'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/country/:key\.:ext?', function (req, res, next) {
    var key = req.params.key;
    Country.get(key, {expand: []}).then(function (country) {
        try {
            if (req.params.ext == 'debug') {
                res.json(country);
            } else {
                res.render('pages/country/key/countryKey2', {
                    country: country,
                    _meta: {
                        title: country.record.participantTitle
                    }
                });
            }
        } catch (e) {
            next(e);
        }
    }, function (err) {
        next(err);
    });
});

router.get('/country2/:key\.:ext?', function (req, res, next) {
    var key = req.params.key;
    //renderPage(req, res, next, require('./test'));
    Country.get(key, {expand: ['news', 'events', 'dataUse']}).then(function (country) {
        try {
            var latest = _.concat(
                _.get(country, 'news.results', []),
                _.get(country, 'dataUse.results', []),
                _.get(country, 'country.results', [])
                );
            country.latest = _.sortBy(latest, ['created']).reverse();
            appendFeed(country).then(function (data) {
                country.feed = data;
                renderPage(req, res, next, country);
            }, function () {
                //ignore error and render page without participants news feed
                renderPage(req, res, next, country);
            });
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
            res.render('pages/country/key/countryKey', {
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

function appendFeed(country) {
    try {
        let deferred = Q.defer(),
            endpoints = country.record.endpoints,
            feed;
        endpoints.forEach(function (e) {
            if (e.type == 'FEED' && e.url) {
                feed = e;
            }
        });
        if (feed) {
            helper.getApiData(feed.url, function (err, data) {
                if (typeof data.errorType !== 'undefined') {
                    deferred.reject(new Error(err));
                } else if (data) {
                    deferred.resolve(data);
                }
                else {
                    deferred.reject(new Error(err));
                }
            }, {retries: 1, timeoutMilliSeconds: 3000, type: 'XML'});
        } else {
            deferred.resolve(undefined);
        }
        return deferred.promise;
    } catch (err) {
        return err;
    }
}