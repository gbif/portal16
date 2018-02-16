'use strict';
let Q = require('q'),
    _ = require('lodash'),
    helper = require('../../util/util'),
    apiConfig = require('../apiConfig');

function rollUpCounts(downloads) {
    let rollUp = {};
    rollUp.total = downloads.count;
    rollUp.occurrences = 0;
    let filterCounts = {
        noFilter: 0,
        keys: {}
    };
    downloads.results.forEach(function(result) {
        let downloadQuery = _.get(result, 'download.request.predicate');
        rollUp.occurrences += _.get(result, 'numberRecords', 0);

        // filters used
        if (!downloadQuery) {
            filterCounts.noFilter++;
        } else {
            let predicates = getPredicates(downloadQuery);
            _.uniqBy(predicates, 'key').forEach(function(predicate) {
                filterCounts.keys[predicate.key] = filterCounts.keys[predicate.key] ? filterCounts.keys[predicate.key] + 1 : 1;
            });
        }
    });

    // dates
    if (downloads.count > 1) {
        rollUp.dates = {
            last: _.get(downloads, 'results[0].download.created'),
            first: _.get(_.last(downloads.results), 'download.created')
        };
    }

    // filterCounts to sorted list
    filterCounts.keys = _.flatMap(filterCounts.keys, function(value, key) {
        return {
            field: key,
            value: value
        };
    });
    filterCounts.keys = _.sortBy(filterCounts.keys, ['value']).reverse();

    rollUp.filterCounts = filterCounts;
    return rollUp;
}

function getDownloads(key, limit) {
    let deferred = Q.defer();
    helper.getApiData(apiConfig.occurrenceDownloadDataset.url + key + '?limit=' + limit, function(err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else if (data) {
            deferred.resolve(data);
        } else {
            deferred.reject(err);
        }
    }, {
        timeoutMilliSeconds: 60000
    });
    return deferred.promise;
}

function getPredicates(predicate) {
    let list = [];
    if (predicate.key) {
        list.push(predicate);
    } else if (_.isArray(predicate.predicates)) {
        predicate.predicates.forEach(function(p) {
            list = list.concat(getPredicates(p));
        });
    }
    return list;
}

function translateFields(data) {
    let helper = require('../../../helpers/format');
    data.filterCounts.keys.forEach(function(e) {
        e.displayName = helper.prettifyEnum(e.field);
    });
}

function getStats(datasetKey, limit) {
    limit = limit || 200;
    let deferred = Q.defer();
    getDownloads(datasetKey, limit).then(function(downloadData) {
        try {
            let summaryData = rollUpCounts(downloadData);
            summaryData.limit = limit;
            summaryData.usedResults = Math.min(limit, downloadData.count);
            translateFields(summaryData);
            deferred.resolve(summaryData);
        } catch (err) {
            deferred.reject(err);
        }
    }, function(err) {
        deferred.reject(err);
    });
    return deferred.promise;
}

module.exports = getStats;
