/**
 * version 1.
 * Locked order. Occurrence list independent of species.
 * no country detection
 *
 *
 * version 2.
 * prioritize results based on likelihood. Species should not always be on top.
 *
 * TODO: Retry on error. Do not fail hard. Log errors. Return whatever we have within n seconds
 *
 *
 * @type {exports|module.exports}
 */
var helper = require('../../util/util'),
    async = require('async');

function getData(key, cb) {
    async.auto(
        {
            occurrenceRecord: function(callback) {
                helper.getApiData('http://api.gbif.org/v1/occurrence/' + key, function(err, data) {
                    if (typeof data.errorType !== 'undefined') {
                        callback(err, data)
                    } else if (data) {
                        callback(err, data)
                    }
                    else {
                        callback(err, null)
                    }
                });
            },
            publisher: [
                'occurrenceRecord', function(callback, results) {
                    if (typeof results.occurrenceRecord.errorType !== 'undefined' || typeof results.occurrenceRecord.publishingOrgKey === 'undefined') {
                        callback(null, null);
                    } else {
                        helper.getApiData('http://api.gbif.org/v1/organization/' + results.occurrenceRecord.publishingOrgKey, callback);
                    }
                }
            ],
            dataset: [
                'occurrenceRecord', function(callback, results) {
                    if (typeof results.occurrenceRecord.errorType !== 'undefined' || typeof results.occurrenceRecord.datasetKey === 'undefined') {
                        callback(null, null);
                    } else {
                        helper.getApiData('http://api.gbif.org/v1/dataset/' + results.occurrenceRecord.datasetKey, callback);
                    }
                }
            ]
        },
        cb
    );
}


function get(key, cb) {
    getData(key, function(err, results){
        if (err) {
            console.log(err);
        }
        cb(results);
    });
}

module.exports = (function(){
    return {
        get: get
    };
})();