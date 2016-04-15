var helper = require('../util/util'),
    async = require('async');

function getData(key, cb) {
    async.auto(
        {
            datasetDetails: function(callback) {
                helper.getApiData('http://api.gbif.org/v1/dataset/' + key, function (err, data) {
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
                'datasetDetails', function(callback, results) {
                    if (typeof results.datasetDetails.errorType !== 'undefined' || typeof results.datasetDetails.publishingOrganizationKey === 'undefined') {
                        callback(null, null);
                    } else {
                        helper.getApiData('http://api.gbif.org/v1/organization/' + results.datasetDetails.publishingOrganizationKey, callback);
                    }
                }
            ],
            installation: [
                'datasetDetails', function(callback, results) {
                    if (typeof results.datasetDetails.errorType !== 'undefined' || typeof results.datasetDetails.installationKey === 'undefined') {
                        callback(null, null);
                    } else {
                        helper.getApiData('http://api.gbif.org/v1/installation/' + results.datasetDetails.installationKey, callback);
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