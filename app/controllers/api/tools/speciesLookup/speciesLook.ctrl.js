let express = require('express'),
    // async = require('async'),
    // hash = require('object-hash'),
    // _ = require('lodash'),
    // Q = require('q'),
    // apiConfig = require('../../../../models/gbifdata/apiConfig'),
    // helper = require('../../../../models/util/util'),
    // github = require('octonode'),
    // querystring = require('querystring'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/api/tools/species-count', router);
};

router.post('/count', function(req, res) {
    // just return error for now and disable en browser
    res.status = 500;
    res.json({error: 'NOT IMPLEMENTED YET'});

    // if (!isValidIdList(req.body.taxonKeys)) {
    //    //respond with error message
    //    res.status(500);
    //    res.json({
    //        message: 'expected body parameter "taxonKeys" to be an array of integers'
    //    });
    // } else if (!req.body.names || !isValidNameList(req.body.names) || req.body.names.length != req.body.taxonKeys.length) {
    //    //respond with error message
    //    res.status(500);
    //    res.json({
    //        message: 'expected body parameter "names" to be an array of strings of same length as taxonKeys'
    //    });
    // } else if (typeof req.body.countryCode !== 'string' || req.body.countryCode.length != 2) {
    //    //respond with error message
    //    res.status(500);
    //    res.json({
    //        message: 'expected body paramteter "countryCode" to be a 2 letter country code'
    //    });
    // } else {
    //    var referenceId = hash({
    //        keys: req.body.taxonKeys,
    //        date: Date.now()
    //    });
    //
    //    //countSpecies(req.body.taxonKeys, req.body.names, req.body.countryCode, referenceId); //disabled for now. Later find a good way to count species
    //
    //    res.json({
    //        referenceId: referenceId
    //    });
    // }
});

// function countSpecies(list, names, countryCode, referenceId) {
//    countItems(list, countryCode, function (data) {
//        saveResults(data, names, referenceId);
//    });
// }

// function countItem(item, countryCode, callback) {
//    speciesCount({
//        taxon_key: item,
//        country: countryCode
//    }).then(function (data) {
//        callback(null, {
//            taxon_key: item,
//            count: data.count
//        });
//    }, function (err) {
//        callback(err);
//    });
// }

// function countItems(list, countryCode, callback) {
//    async.mapLimit(list, 10, function (item, cb) {
//        countItem(item, countryCode, cb);
//    }, function (err, data) {
//        if (err) {
//            //TODO inform the user that not everything could be matched
//        } else {
//            callback(data);
//        }
//    });
// }

// function speciesCount(query) {
//    "use strict";
//    var deferred = Q.defer();
//    helper.getApiData(apiConfig.occurrenceSearch.url + '?limit=0&' + querystring.stringify(query), function (err, data) {
//        if (typeof data.errorType !== 'undefined') {
//            deferred.reject(new Error(err));
//        } else if (data) {
//            deferred.resolve(data);
//        }
//        else {
//            deferred.reject(new Error(err));
//        }
//    }, {retries: 3, timeoutMilliSeconds: 10000});
//    return deferred.promise;
// }

// function saveResults(data, names, referenceId) {
//    var client = github.client({
//        username: 'mortenhofft',
//        password: require('../../../../../config/config').githubPassword //TODO take from credentials file
//    });
//
//    var ghrepo = client.repo('MortenHofft/slettes');
//
//    var content = getCsvContent(data, names);
//    ghrepo.createContents(referenceId + '/counts.csv', 'created from user request', content, function () { //err, data, headers
//    }); //path
// }

// function getCsvContent(data, names) {
//    var csvContent = 'key, scientificName, count\n';
//    //write rows
//    data.forEach(function (e, i) {
//        //write row
//        csvContent += e.taxon_key + ',"' + names[i] + '",' + e.count + '\n';
//    });
//    return csvContent;
// }

// function isValidIdList(taxonList) {
//    //expect an array of integers
//    if (!_.isArray(taxonList)) {
//        return false;
//    }
//    for (var i = 0; i < taxonList.lenght; i++) {
//        if (!_.isSafeInteger(taxonList[i])) {
//            return false;
//        }
//    }
//    return true;
// }
//
// function isValidNameList(nameList) {
//    //expect an array of strings
//    if (!_.isArray(nameList)) {
//        return false;
//    }
//    for (var i = 0; i < nameList.lenght; i++) {
//        if (!_.isString(nameList[i])) {
//            return false;
//        }
//    }
//    return true;
// }
