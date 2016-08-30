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
    occurrenceSearch(req.query).then(function(data) {
        let expandConfig = {
            facets: true,
            query: req.query,
            expandList: [
                {
                    fromKey: 'datasetKey',
                    type: gbifData.expand.types.DATASET_KEY
                },
                {
                    fromKey: 'publishingOrgKey',
                    type: gbifData.expand.types.PUBLISHING_ORG
                }
            ]
        };
        gbifData.expand.expand(data, expandConfig, res.__, function(err){
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
    }, {retries: 3, timeoutMilliSeconds:10000});
    return deferred.promise;
}