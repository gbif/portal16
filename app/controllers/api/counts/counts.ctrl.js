"use strict";
let express = require('express'),
    router = express.Router(),
    Q = require('q'),
    _ = require('lodash'),
    helper = rootRequire('app/models/util/util'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig');

const querystring = require('querystring');

module.exports = function (app) {
    app.use('/api/count', router);
};

router.get('/country/:iso/about/countries', function (req, res, next) {
    var iso = req.params.iso;
    let query = {
        facet: 'publishing_country',
        country: iso,
        'publishing_country.facetLimit': 1000,
        limit: 0
    };
    //res.json(query);
    search(apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query)).then(function (data) {
        let facets = _.get(data, 'facets[0].counts', []);
        res.json({
            count: facets.length,
            limit: 10,
            results: facets.slice(0, 10)
        });
    }, function (err) {
        next(err);
    });
});

router.get('/country/:iso/from/countries', function (req, res, next) {
    let iso = req.params.iso,
        query = {
            facet: 'country',
            publishingCountry: iso,
            'country.facetLimit': 1000,
            limit: 0
        };

    search(apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query)).then(function (data) {
        let facets = _.get(data, 'facets[0].counts', []);
        res.json({
            count: facets.length,
            limit: 10,
            results: facets.slice(0, 10)
        });
    }, function (err) {
        next(err);
    });
});

router.get('/country/:iso/about/datasets', function (req, res, next) {
    let iso = req.params.iso,
        query = {
            facet: 'datasetKey',
            country: iso,
            'publishing_country.facetLimit': 1000,
            limit: 0
        };

    search(apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query)).then(function (data) {
        let facets = _.get(data, 'facets[0].counts', []);
        res.json({
            count: facets.length,
            limit: 10,
            results: facets.slice(0, 10)
        });
    }, function (err) {
        next(err);
    });
});

function search(url) {
    "use strict";
    let deferred = Q.defer();
    helper.getApiData(url, function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(new Error(err));
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(new Error(err));
        }
    }, {retries: 2, timeoutMilliSeconds: 30000});
    return deferred.promise;
}