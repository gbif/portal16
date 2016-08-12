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

router.get('/dataset/search', function (req, res, next) {
    datasetSearch(req.query).then(function(data) {
        gbifData.expandFacetsAndFilters(data, req.query, res.__, function(err){
            if (err) {
                //TODO handle expansion errors
                res.json(data);
            } else {
                res.json(data);
            }
        });

    }, function(err){
        //TODO should this be logged here or in model/controller/api?
        //TODO dependent on the error we should show different information. 404. timeout or error => info about stability.
        console.log('error in ctrl ' + err);
        next();
    });
});


function datasetSearch(query) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(apiConfig.datasetSearch.url + '?' + querystring.stringify(query), function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(new Error(err));
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(new Error(err));
        }
    });
    return deferred.promise;
}
