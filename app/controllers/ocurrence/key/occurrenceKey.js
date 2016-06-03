"use strict";
var Q = require('q'),
    occurrenceCoreTerms = require('../../../models/gbifdata/occurrence/occurrenceCoreTerms'),
    getAnnotation = require('../../../models/gbifdata/occurrence/occurrenceAnnotate'),
    getTitle = require('./title'),
    occurrencIssues = require('./issues'),
    Occurrence = require('../../../models/gbifdata/gbifdata').Occurrence;

function getAngularInitData(occurrence) {
    var keys = [
        'key',
        'decimalLatitude',
        'decimalLongitude',
        'verbatimLocality',
        'coordinateAccuracyInMeters',
        'eventDate',
        'taxonKey',
        'lastParsed'
    ];
    var selectedData = {};
    keys.forEach(function(e){
        selectedData[e] = occurrence.record[e];
    });
    return selectedData;
}

function getLastNormalCrawled(datasetProcess) {
    if (datasetProcess.count) {
        for (var i = 0; i < datasetProcess.count; i++) {
            var job = datasetProcess.results[i];
            if (job.finishReason == 'NORMAL' || job.finishReason == 'NOT_MODIFIED') { //TODO what is the possible values here?
                return job.finishedCrawling;
            }
        }
    }
}

function getLastSync(occurrence) {
    var dates = [],
        lastNormalCrawl = getLastNormalCrawled(occurrence.datasetProcess);

    if (lastNormalCrawl) dates.push(lastNormalCrawl);
    if (occurrence.record.modified) dates.push(occurrence.record.modified);
    if (occurrence.record.lastParsed) dates.push(occurrence.record.lastParsed);
    if (occurrence.record.lastCrawled) dates.push(occurrence.record.lastCrawled);
    dates.sort().reverse();
    return dates[0];
}

function highlight(occurrence) {
    var highlights = {};

    highlights.lastSynced = getLastSync(occurrence);
    //get last successful crawl date

    return highlights;
}

function getUsedOccurrenceCoreTerms(occurrence, terms) {
    var usedTerms = [];
    var usedGroups = new Set();
    var groups = {};
    terms.sort((a, b) => a.simpleName < b.simpleName ? -1 : 1);
    terms.forEach(function(e){
        if (e.source !== 'DwcTerm' && e.source !== 'DcTerm') {
            return;
        }
        if (typeof occurrence.record[e.simpleName] !== 'undefined' || typeof occurrence.verbatim[e.qualifiedName] !== 'undefined') {
            usedTerms.push(e);
            groups[e.group] = groups[e.group] || [];
            groups[e.group].push(e);
            if (typeof e.group !== 'undefined') usedGroups.add(e.group);
        }
    });
    return {
        terms: usedTerms,
        usedGroups: Array.from(usedGroups),
        groups: groups
    };
}

function getUsedExtensionTerms(verbatim) {
    var used = {};
    if (verbatim.extensions) {
        Object.keys(verbatim.extensions).forEach(function(extensionType){
            if (verbatim.extensions[extensionType].length > 0) {
                used[extensionType] = {};
                verbatim.extensions[extensionType].forEach(function(extension){
                    Object.keys(extension).forEach(function(field) {
                        used[extensionType][field] = true;
                    });
                });
            }
        });
    }
    return used;
}


function getOccurrenceModel(occurrenceKey, __) {
    var deferred = Q.defer();
    var getOptions = {
        expand: ['publisher', 'dataset', 'datasetProcess', 'verbatim']
    };

    var promises = [
        Occurrence.get(occurrenceKey, getOptions),
        occurrenceCoreTerms
    ];

    Q.all(promises).spread(function(occurrence, occurrenceMeta) {
        occurrence.highlights = highlight(occurrence);
        occurrence.computedFields = {
            title: getTitle(occurrence, __)
        };
        occurrence.annotation = getAnnotation(occurrence.record);
        occurrence.terms = getUsedOccurrenceCoreTerms(occurrence, occurrenceMeta.terms);
        occurrence.issues = occurrencIssues.getFieldsWithIssues(occurrence.record.issues, occurrenceMeta.remarks);
        occurrence.issueSummary = occurrencIssues.getSummary(occurrence.record.issues, occurrenceMeta.remarks);
        occurrence.fieldsWithDifferences = occurrencIssues.getFieldsWithDifferences(occurrence.record, occurrence.verbatim, occurrence.terms.terms);
        occurrence.usedExtensionFields = getUsedExtensionTerms(occurrence.verbatim);
        deferred.resolve(occurrence);
    }, function(err){
        deferred.reject(new Error(err));
    }).fail(function (err) {
        deferred.reject(new Error(err));
    }).done();

    return deferred.promise;
}

module.exports = {
    getOccurrenceModel: getOccurrenceModel,
    getAngularInitData: getAngularInitData
};