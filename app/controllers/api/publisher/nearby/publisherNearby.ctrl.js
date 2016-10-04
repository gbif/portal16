"use strict";
var express = require('express'),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    router = express.Router();

const querystring = require('querystring');

module.exports = function (app) {
    app.use('/api/publisher', router);
};

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