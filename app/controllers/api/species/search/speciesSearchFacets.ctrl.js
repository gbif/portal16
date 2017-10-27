"use strict";
var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    async = require('async'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/gbifdata/apiConfig');

const querystring = require('querystring');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/species/constituents', function (req, res) {
    //clear all facets and ask for speciesKey facet only
    // var type = req.query.type || 'species';
    // if (['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'].indexOf(type) < 0) {
    //     res.status(500);
    //     res.send('Invalid type.');
    // }
    var type = "constituent";
    req.query.facet = type + 'Key';

    //get on emore facet than asked for and use that to test for last
    var facetLimit = parseInt(req.query.limit) || 20;
    var offset = parseInt(req.query.offset) || 0;
    req.query[type + 'Key.facetOffset'] = offset;
    req.query[type + 'Key.facetLimit'] = facetLimit + 1;

    //We do not care about the result count
    req.query.limit = 0;
    req.query.offset = undefined;

    var endOfRecords = false;
    taxonSearch(req.query).then(function (datasets) {
        var datasetKeys = _.get(datasets, 'facets[0].counts', []);

        //only return the amount asked for, and since we addded one to test for last, then remove last
        if (datasetKeys.length <= facetLimit) {
            endOfRecords = true;
        } else {
            datasetKeys.pop();
        }

        async.map(datasetKeys, function(item, cb){
            helper.getApiData(apiConfig.dataset.url + item.name, function(err, dataset) {
                if (err) {
                    cb(err);
                } else if (typeof dataset.errorType !== 'undefined') {
                    cb(dataset.errorType)
                } else {
                    dataset._constituentTaxoncount = item.count;
                    cb(null, dataset);
                }
            });
        }, function(err, results) {
            if (err) {
                res.json({err: 'failed to look up all keys'});
            } else {
                var response = {
                    offset: offset,
                    limit: facetLimit,
                    endOfRecords: endOfRecords,
                    results: results
                };
                res.json(response);
            }
        });
    }, function (err) {
        res.status(_.get(err, 'errorResponse.statusCode', 500));
        res.json({
            body: _.get(err, 'errorResponse.body', err)
        });
    });
});

function taxonSearch(query) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(apiConfig.taxonSearch.url + '?' + querystring.stringify(query), function (err, data) {
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