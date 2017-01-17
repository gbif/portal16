"use strict";
var express = require('express'),
    router = express.Router(),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    gbifData = require('../../../../models/gbifdata/gbifdata');

const querystring = require('querystring');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/occurrence/search', function (req, res, next) {
    delete req.query.locale;
    delete req.query.advanced;
    occurrenceSearch(req.query).then(function (data) {
        let settings = {
            facets: true,
            query: req.query,
            expandList: [
                {
                    fromKey: 'datasetKey',
                    type: expandConfig.DATASET_KEY
                },
                {
                    fromKey: 'publishingOrgKey',
                    type: expandConfig.PUBLISHING_ORG
                }
            ],
            expandConfig: expandConfig
        };
        gbifData.expand.expand(data, settings, res.__, function (err) {
            if (err) {
                //TODO handle expansion errors
                res.json(data);
            } else {
                res.json(data);
            }
        });

    }, function (err) {
        next(err);//TODO throw more informative error to client
    });
});

function occurrenceSearch(query) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query), function (err, data) {
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

const expandConfig = {
    PUBLISHING_ORG: {
        type: 'KEY',
        endpoint: apiConfig.publisher.url,
        fromKey: 'title'
    },
    DATASET_KEY: {
        type: 'KEY',
        endpoint: apiConfig.dataset.url,
        fromKey: 'title'
    },
    BASIS_OF_RECORD: {
        type: 'ENUM',
        translationPath: 'basisOfRecord.'
    },
    KINGDOM_KEY: {
        type: 'KEY',
        endpoint: apiConfig.taxon.url,
        fromKey: 'scientificName'
    }
};