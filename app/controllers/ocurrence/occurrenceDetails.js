"use strict";
var Q = require('q'),
    occurrenceFields = require('../../models/gbifdata/occurrence/occurrenceFields'),
    Occurrence = require('../../models/gbifdata/gbifdata').Occurrence;

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
            if (job.finishReason == 'NORMAL' || job.finishReason == 'NOT_MODIFIED') {
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

function getOccurrenceModel(occurrenceKey) {
    var deferred = Q.defer();
    var getOptions = {
        expand: ['publisher', 'dataset', 'datasetProcess', 'verbatim']
    };
    Occurrence.get(occurrenceKey, getOptions).then(function(occurrence) {
        occurrence.highlights = highlight(occurrence);
        deferred.resolve(occurrence);
    }, function(err){
        console.log('error from expand: ' + err); //TODO
        deferred.reject(new Error(err));
    });
    return deferred.promise;
}



module.exports = {
    getOccurrenceModel: getOccurrenceModel,
    getAngularInitData: getAngularInitData,
    occurrenceFields: occurrenceFields
};