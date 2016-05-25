'use strict';

var Q = require('q'),
    async = require('async'),
    helper = require('../../util/util');

function getTerms(callback) {
    helper.getApiData('http://api.gbif-dev.org/v1/occurrence/term', callback, {timeoutMilliSeconds: 10000, retries: 5, failHard: true});
}

function getRemarkTypes(callback) {
    helper.getApiData('http://api.gbif-dev.org/v1/occurrence/interpretation', callback, {timeoutMilliSeconds: 10000, retries: 5, failHard: true});
}

function getQualifiedToSimple(terms) {
    var map = {};
    terms.forEach(function(term){
        map[term.qualifiedName] = term.simpleName;
    });
    return map;
}

function transformRemarks(remarks, terms) {
    var nameMap = getQualifiedToSimple(terms),
        remarksMap = {};

    remarks.remarks.forEach(function(remark){
        remark.relatedSimpleTerms = remark.relatedTerms.map(x => nameMap[x]);
        remarksMap[remark.type] = remark;
    });

    return remarksMap;
}

function getOccurrenceMetaData() {
    var deferred = Q.defer();
    async.parallel({terms: getTerms, remarks: getRemarkTypes}, function(err, data){
        if (err !== null) {
            deferred.reject(new Error(err));
        } else if (data) {
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
