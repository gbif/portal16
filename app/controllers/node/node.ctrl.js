"use strict";

var express = require('express'),
    utils = rootRequire('app/helpers/utils'),
    helper = rootRequire('app/models/util/util'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    Q = require('q'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/node/:key\.:ext?', function (req, res, next) {
    var nodeKey = req.params.key;
    if (!utils.isGuid(nodeKey)) {
        next();
    } else {
        nodeSearch(nodeKey).then(function(node) {
            if (node.type === 'COUNTRY' && node.country) {
                res.redirect('/country/' + node.country);
            } else {
                next();//TODO handle non country participants
            }
        }, function(err){
           next(err);
        });
    }
});

function nodeSearch(key) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(apiConfig.node.url + key, function (err, data) {
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