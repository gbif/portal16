"use strict";
var express = require('express'),
    router = express.Router(),
    Q = require('q'),
    helper = rootRequire('app/models/util/util'),
    cmsBaseUrl = rootRequire('app/models/cmsData/apiConfig').base.url;

const querystring = require('querystring');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/home/latest', function (req, res, next) {
    var request = req.originalUrl.substr(14);

    cmsSearch(requestedUrl).then(function (data) {
        res.json(data);
    }, function (err) {
        next(err);
    });
});

function cmsSearch(requestedUrl) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(cmsBaseUrl + requestedUrl, function (err, data) {
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