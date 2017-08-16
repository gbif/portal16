'use strict';

var Q = require('q'),
    async = require('async'),
    api = require('../apiConfig'),
    helper = require('../../util/util');

function getTerms(callback) {
    helper.getApiData(api.occurrenceTerm.url, callback, {timeoutMilliSeconds: 10000, retries: 5, failHard: true});
}

function getRemarkTypes(callback) {
    helper.getApiData(api.occurrenceInterpretation.url, callback, {
        timeoutMilliSeconds: 10000,
        retries: 5,
        failHard: true
    });
}

function getQualifiedToSimple(terms) {
    var map = {};
    terms.forEach(function (term) {
        map[term.qualifiedName] = term.simpleName;
    });
    return map;
}

function transformRemarks(remarks, terms) {
    var nameMap = getQualifiedToSimple(terms),
        remarksMap = {};

    remarks.forEach(function (remark) {
        remark.relatedSimpleTerms = remark.relatedTerms.map(x => nameMap[x]);
        remarksMap[remark.id] = remark;
    });

    return remarksMap;
}

function sortTerms(terms) {
    terms = terms.sort((a, b) => a.simpleName < b.simpleName ? -1 : 1);
    var termOrder = {};
    //sort order of terms in a set order followed by alphabetically
    [
        'day', 'month', 'year',
        'kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species', 'specificEpithet'
    ].forEach(function (e, i) {
        termOrder[e] = i - 1000;
    });
    terms.sort(function (a, b) {
        var indexA = termOrder[a.simpleName] || 0;
        var indexB = termOrder[b.simpleName] || 0;
        return indexA - indexB;
    });
    return terms;
}

function getOccurrenceMetaData() {
    var deferred = Q.defer();
    async.parallel({terms: getTerms, remarks: getRemarkTypes}, function (err, data) {
        if (err !== null) {
            console.error('failed to load occurrence terms');
            console.error(err.statusMessage);
            process.exit(1);
            deferred.reject(new Error(err));
        } else if (data) {
            data.terms = sortTerms(data.terms);
            data.remarks = transformRemarks(data.remarks, data.terms);
            deferred.resolve(data);
        }
        else {
            deferred.reject(new Error('Error while getting initial occurrence terms and issue types'));
        }
    });
    return deferred.promise;
}

module.exports = getOccurrenceMetaData();
