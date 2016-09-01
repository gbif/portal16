"use strict";
var express = require('express'),
    router = express.Router(),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    gbifData = require('../../../../models/gbifdata/gbifdata');

const querystring = require('querystring');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/species/search', function (req, res, next) {
    speciesSearch(req.query).then(function(data) {
        data = prune(data, ['descriptions']);
        let settings = {
            facets: true,
            query: req.query,
            expandList: [
                {
                    fromKey: 'datasetKey',
                    type: expandConfig.DATASET_KEY
                }
            ],
            expandConfig: expandConfig
        };
        gbifData.expand.expand(data, settings, res.__, function(err){
            if (err) {
                //TODO handle expansion errors
                res.json(data);
            } else {

                res.json(data);
            }
        });

    }, function(err){
        //TODO should this be logged here or in model/controller/api?
        //TODO dependent on the error we should show different information. 404. timeout or error => info about stability.
        console.log('error in ctrl ' + err);
        next();
    });
});

function prune(data, keys) {
    "use strict";
    data.results.forEach(function(item){
        keys.forEach(function(key){
            delete item[key];
        });
    });
    return data
}

function speciesSearch(query) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(apiConfig.taxonSearch.url + '?' + querystring.stringify(query), function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(new Error(err));
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(new Error(err));
        }
    }, {retries: 3, timeoutMilliSeconds:10000});
    return deferred.promise;
}

const expandConfig = {
    RANK: {
        type: 'ENUM',
        translationPath: 'taxonRank.'
    },
    DATASET_KEY: {
        type: 'KEY',
        endpoint: apiConfig.dataset.url,
        fromKey: 'title'
    },
    CONSTITUENT_KEY: {
        type: 'KEY',
        endpoint: apiConfig.dataset.url,
        fromKey: 'title'
    },
    HIGHERTAXON_KEY: {
        type: 'KEY',
        endpoint: apiConfig.taxon.url,
        fromKey: 'canonicalName'
    },
    ISSUE: {
        type: 'ENUM',
        translationPath: 'taxon.issueEnum.'
    },
    NAME_TYPE: {
        type: 'ENUM',
        translationPath: 'taxon.nameTypeEnum.'
    },
    STATUS: {
        type: 'ENUM',
        translationPath: 'taxon.statusEnum.'
    }
};