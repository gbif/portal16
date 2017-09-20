"use strict";
var Q = require('q'),
    _ = require('lodash'),
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
        'lastParsed',
        'coordinateUncertaintyInMeters'
    ];
    var selectedData = {};
    keys.forEach(function (e) {
        selectedData[e] = occurrence.record[e];
    });
    return selectedData;
}

function getLastNormalCrawled(datasetProcess) {
    if (datasetProcess.count) {
        for (var i = 0; i < datasetProcess.results.length; i++) {
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

    //get last successful crawl date
    highlights.lastSynced = getLastSync(occurrence);

    return highlights;
}

function getUsedOccurrenceCoreTerms(occurrence, terms) {
    let usedTerms = [],
        usedGroups = new Set(),
        groups = {},
        groupsOrder = {
            'Record': 1,
            'Occurrence': 2,
            'Event': 3,
            'Identification': 4,
            'Taxon': 5,
            'Location': 6,
            'Organism': 7,
            'MaterialSample': 8,
            'GeologicalContext': 9
        },
    //field terms that are to be included independent of their source. that is included these gbif specific terms
        whiteList = {
            elevation: true,
            elevationAccuracy: true,
            depth: true,
            depthAccuracy: true,
            distanceAboveSurface: true,
            distanceAboveSurfaceAccuracy: true
        };
    terms.forEach(function (e) {
        if (e.source !== 'DwcTerm' && e.source !== 'DcTerm' && typeof whiteList[e.simpleName] === 'undefined') {
            return;
        }
        if ( notEmpty(occurrence.record[e.simpleName]) || notEmpty(occurrence.verbatim[e.qualifiedName])) {
            usedTerms.push(e);
            let group = e.group || 'other';
            groups[group] = groups[group] || [];
            groups[group].push(e);
            usedGroups.add(group);
        }
    });

    usedGroups = Array.from(usedGroups).sort(function (a, b) {
        return (groupsOrder[a] || 100) - (groupsOrder[b] || 100);
    });
    return {
        terms: usedTerms,
        usedGroups: Array.from(usedGroups),
        groups: groups
    };
}

function notEmpty(value){
    return !_.isUndefined(value) && (!_.isObjectLike(value) || !_.isEmpty(value))
}

function getUsedExtensionTerms(verbatim) {
    var used = {};
    if (verbatim.extensions) {
        Object.keys(verbatim.extensions).forEach(function (extensionType) {
            if (verbatim.extensions[extensionType].length > 0) {
                used[extensionType] = {};
                verbatim.extensions[extensionType].forEach(function (extension) {
                    Object.keys(extension).forEach(function (field) {
                        used[extensionType][field] = true;
                    });
                });
                if (_.isEmpty(used[extensionType])) {
                    delete used[extensionType];
                }
            }
        });
    }
    return used;
}


function getOccurrenceModel(occurrenceKey, __) {
    var deferred = Q.defer();
    var getOptions = {
        expand: ['publisher', 'dataset', 'datasetProcess', 'verbatim', 'taxonName']
    };

    var promises = [
        Occurrence.get(occurrenceKey, getOptions),
        occurrenceCoreTerms()
    ];

    Q.all(promises).spread(function (occurrence, occurrenceMeta) {
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
    }, function (err) {
        deferred.reject(err);
    }).fail(function (err) {
        deferred.reject(err);
    }).done();

    return deferred.promise;
}

module.exports = {
    getOccurrenceModel: getOccurrenceModel,
    getAngularInitData: getAngularInitData
};
