"use strict";
/**
 * An endpoint to serve historic weather reports. Used by the occurrence page as supplemental information and not crucial.
 */
var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    async = require('async');

const querystring = require('querystring');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/occurrence/search', function (req, res, next) {
    occurrenceSearch(req.query).then(expandKeys).then(function(data) {
        res.json(data);
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
    });
    return deferred.promise;
}

 function filterObj( obj, reference ) {
    let keysToDelete = _.difference(_.keys( obj ), reference);
    keysToDelete.forEach(function(key){
        delete obj[key];
    });
    return obj;
 }

//function pruneObj( obj, reference ) {
//    let keysToDelete = _.intersection(_.keys( obj ), reference);
//    keysToDelete.forEach(function(key){
//        delete obj[key];
//    });
//    return obj;
//}

function expandKeys(occurrences) {
    "use strict";
    var deferred = Q.defer();

    //async returns this
    /*
    {
        dataset_7c67da7f-490e-4e8d-8848-7dc152dd4734: the-data-set,
        dataset_b9a43c60-d2b6-445c-9362-2db65465c963: the-other-data-set,
        publisher_34e6e625-47cf-4d42-8054-af0c2f1b6e64: the-publisher-info
    }
    and we then attach it to the results as new keys (e.g. _dataset: the-data-set)
    */

    //Create task object with the keys that ae used in this response
    let tasks = {};
    occurrences.results.forEach(function(e){
        tasks['dataset_' + e.datasetKey] = function(cb) {
            helper.getApiData(apiConfig.dataset.url + e.datasetKey, cb);
        };
        tasks['publisher_' + e.publishingOrgKey] = function(cb) {
            helper.getApiData(apiConfig.publisher.url + e.publishingOrgKey, cb);
        };
    });

    //run tasks
    async.parallel(tasks, function(err, data){
        if (_.isUndefined(err)) {
            deferred.reject(new Error(err));
        } else {
            //once all the keys and their values is returned, then attach to the individual results that have that key
            occurrences.results.forEach(function (e) {
                // consider pruning the api results as well as this proxy is used for showing a specific view.
                // preliminary tries indicate that the size easily shrinks to 2/3, but the compressed size change very little (~1kb) and the response time is a bit longer (5ms).
                // so it might not be worth it, givin that it then puts restraints on what we can do in the client. It could do some good fot the client though to have less data to joggle, but it doesn't seem to be a problem with only 20 records loaded per default.
                //pruneObj(e, ['elevation', 'elevationAccuracy', 'depth', 'occurrenceID', 'otherCatalogNumbers', 'disposition', 'language', 'modified', 'eventDate', 'occurrenceRemarks', 'protocol', 'lastCrawled', 'lastParsed', 'extensions', 'lastInterpreted', 'identifiers', 'facts', 'relations', 'geodeticDatum', 'habitat', 'preparations', 'bibliographicCitation']);

                //prune the extended results to keep the response json small
                e._dataset = filterObj(data['dataset_' + e.datasetKey], ['title']);
                e._publisher = filterObj(data['publisher_' + e.publishingOrgKey], ['title']);
            });
            deferred.resolve(occurrences);
        }
    });
    return deferred.promise;
}
