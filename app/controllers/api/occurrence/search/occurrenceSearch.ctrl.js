"use strict";
/**
 * An endpoint to serve historic weather reports. Used by the occurrence page as supplemental information and not crucial.
 */
var express = require('express'),
    router = express.Router(),
    //_ = require('underscore'),
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

// function pruneObj( obj, reference ) {
//  let keysToDelete = _.difference(_.keys( obj ), reference) 
//  keysToDelete.forEach(function(key){
//      delete obj[key];
//  });
//  return obj;
// }

function expandKeys(occurrences) {
    "use strict";
    var deferred = Q.defer();
    let tasks = [];
    occurrences.results.forEach(function(e){
        //pruneObj(e, ['key', 'media', 'datasetKey', 'publishingOrgKey']);
        tasks.push({
            item: e,
            endpoint: apiConfig.dataset.url + e.datasetKey,
            key: '_dataset',
            values: ['title', 'description']
        });
        tasks.push({
            item: e,
            endpoint: apiConfig.publisher.url + e.publishingOrgKey,
            key: '_publisher',
            values: ['title']
        });
    });
    async.each(tasks, function(task, cb){
        helper.getApiData(task.endpoint, function(err, data){
            if (typeof data.errorType === 'undefined') {
                let prunedData = {};
                task.values.forEach(function(valueKey){
                    prunedData[valueKey] = data[valueKey];
                });
                task.item[task.key] = prunedData;
            }
            cb();
        });
    }, function(err) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            deferred.resolve(occurrences);
        }
    });
    return deferred.promise;
}
