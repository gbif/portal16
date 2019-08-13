'use strict';

let Q = require('q'),
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
    let map = {};
    terms.forEach(function(term) {
        map[term.qualifiedName] = term.simpleName;
    });
    return map;
}

function transformRemarks(remarks, terms) {
    let nameMap = getQualifiedToSimple(terms),
        remarksMap = {};

    remarks.forEach(function(remark) {
        remark.relatedSimpleTerms = remark.relatedTerms.map((x) => nameMap[x]);
        remarksMap[remark.id] = remark;
    });

    return remarksMap;
}

function sortTerms(terms) {
    terms = terms.sort((a, b) => a.simpleName < b.simpleName ? -1 : 1);
    let termOrder = {};
    // sort order of terms in a set order followed by alphabetically
    [
        'day', 'month', 'year',
        'kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species', 'specificEpithet',
        'earliestEonOrLowestEonothem', 'latestEonOrHighestEonothem', 'earliestEraOrLowestErathem', 'latestEraOrHighestErathem', 'earliestPeriodOrLowestSystem', 'latestPeriodOrHighestSystem', 'earliestEpochOrLowestSeries', 'latestEpochOrHighestSeries', 'earliestAgeOrLowestStage', 'latestAgeOrHighestStage', 'lowestBiostratigraphicZone', 'highestBiostratigraphicZone', 'lithostratigraphicTerms', 'group', 'formation', 'member', 'bed'
    ].forEach(function(e, i) {
        termOrder[e] = i - 1000;
    });
    terms.sort(function(a, b) {
        let indexA = termOrder[a.simpleName] || 0;
        let indexB = termOrder[b.simpleName] || 0;
        return indexA - indexB;
    });
    return terms;
}

function getOccurrenceMetaData() {
    let deferred = Q.defer();
    async.parallel({terms: getTerms, remarks: getRemarkTypes}, function(err, data) {
        if (err !== null) {
            // TODO log instead of console statements
            // console.error('Error while getting initial occurrence terms and issue types');
            // console.error(err.statusMessage);
            // process.exit(1);
            deferred.reject(new Error(err));
        } else if (data) {
            data.terms = sortTerms(data.terms);
            data.remarks = transformRemarks(data.remarks, data.terms);
            deferred.resolve(data);
        } else {
            deferred.reject(new Error('Error while getting initial occurrence terms and issue types'));
        }
    });
    return deferred.promise;
}

module.exports = getOccurrenceMetaData;
