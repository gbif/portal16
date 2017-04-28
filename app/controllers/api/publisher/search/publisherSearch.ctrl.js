"use strict";
var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    gbifData = require('../../../../models/gbifdata/gbifdata');

const querystring = require('querystring');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/publisher/search', function (req, res) {
    publisherSearch(req.query).then(function (data) {
        data = prune(data, ['contacts', 'comments']);
        let settings = {
            facets: false,
            query: req.query,
            expandList: [
                {
                    fromKey: 'endorsingNodeKey',
                    type: expandConfig.NODE_KEY
                }
            ],
            expandConfig: expandConfig
        };
        gbifData.expand.expand(data, settings, res.__, function (err) {
            if (err) {
                //TODO handle expansion errors
                res.status(500);
                res.json(data);
            } else {
                res.json(data);
            }
        });

    }, function (err) {
        res.status(_.get(err, 'errorResponse.statusCode', 500));
        res.json({
            body: _.get(err, 'errorResponse.body', err)
        });
    });
});

function prune(data, keys) {
    "use strict";
    data.results.forEach(function (item) {
        keys.forEach(function (key) {
            delete item[key];
        });
    });
    return data
}

function publisherSearch(query) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(apiConfig.publisher.url + '?' + querystring.stringify(query), function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(err);
        }
    }, {retries: 3, timeoutMilliSeconds: 10000});
    return deferred.promise;
}

const expandConfig = {
    NODE_KEY: {
        type: 'KEY',
        endpoint: apiConfig.node.url,
        fromKey: 'endorsingNodeKey'
    }
};