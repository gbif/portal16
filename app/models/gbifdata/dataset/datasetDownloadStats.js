"use strict";
var Q = require('q'),
    _ = require('lodash'),
    helper = require('../../util/util'),
    apiConfig = require('../apiConfig');

function rollUpCounts(downloads) {
    let rollUp = {};
    rollUp.total = downloads.count;
    rollUp.occurrences = 0;
    let filterCounts = {
        everything: 0,
        keys: {}
    };
    downloads.results.forEach(function (result) {
        let downloadQuery = _.get(result, 'download.request.predicate');
        rollUp.occurrences += _.get(result, 'numberRecords', 0);

        //filters used
        if (!downloadQuery) {
            filterCounts.everything++;
        } else {
            let predicates = getPredicates(downloadQuery);
            _.uniqBy(predicates, 'key').forEach(function (predicate) {
                filterCounts.keys[predicate.key] = filterCounts.keys[predicate.key] ? filterCounts.keys[predicate.key] + 1 : 1;
            });
        }
    });

    //dates
    if (downloads.count > 1) {
        rollUp.dates = {
            last: _.get(downloads, 'results[0].download.created'),
            first: _.get(_.last(downloads.results), 'download.created')
        };
    }

    rollUp.filterCounts = filterCounts;
    return rollUp;
}

function getDownloads(key) {
    var deferred = Q.defer();
    helper.getApiData(apiConfig.occurrenceDownloadDataset.url + key + '?limit=200', function (err, data) {
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

function getPredicates(predicate) {
    let list = [];
    if (predicate.key) {
        list.push(predicate);
    } else if (_.isArray(predicate.predicates)) {
        predicate.predicates.forEach(function (p) {
            list = list.concat(getPredicates(p));
        });
    }
    return list;
}

function getStats(datasetKey) {
    var deferred = Q.defer();
    getDownloads(datasetKey).then(function (downloadData) {
        try {
            let summaryData = rollUpCounts(downloadData);
            deferred.resolve(summaryData);
        } catch (err) {
            deferred.reject(new Error(err));
        }
    }, function (err) {
        deferred.reject(new Error(err));
    });
    return deferred.promise;
}

module.exports = getStats;