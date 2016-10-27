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

router.get('/publisher/search', function (req, res, next) {
    publisherSearch(req.query).then(function (data) {
        data = prune(data, ['description', 'contacts', 'comments']);
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
                res.json(data);
            } else {

                res.json(data);
            }
        });

    }, function (err) {
        next(err);
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
            deferred.reject(new Error(err));
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(new Error(err));
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