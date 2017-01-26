"use strict";
var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    helper = rootRequire('app/models/util/util'),
    cmsBaseUrl = rootRequire('app/models/cmsData/apiConfig').base.url;

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/redlist/:name', function (req, res) {
    var name = req.params.name;
    var token = req.query.token;
    redlistSearch(name, token).then(function (data) {
        res.json(data);
    }, function (err) {
        res.status(_.get(err, 'errorResponse.statusCode', 500));
        res.json({
            body: _.get(err, 'errorResponse.body', err)
        });
    });
});

function redlistSearch(name, token) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData('http://apiv3.iucnredlist.org/api/v3/species/' + name + '?token=' + token, function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(err);
        }
    }, {retries: 2, timeoutMilliSeconds: 30000});
    return deferred.promise;
}