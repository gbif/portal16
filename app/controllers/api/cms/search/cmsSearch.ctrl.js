'use strict';
var express = require('express'),
    router = express.Router(),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    gbifData = require('../../../../models/gbifdata/gbifdata'),
    cmsData = require('../../../../models/cmsdata/apiConfig');

const querystring = require('querystring');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/cms/search', function (req, res, next) {
    cmsSearch(req.query).then(function(data) {
        //@todo massage facets from CMSAPI for the same expansion.
        res.json(data);
        //gbifData.expandFacets(data.facets, res.__, function(err){});

    }, function(err){
        //TODO should this be logged here or in model/controller/api?
        //TODO dependent on the error we should show different information. 404. timeout or error => info about stability.
        console.log('error in ctrl ' + err);
        next();
    });
});


function cmsSearch(query) {
    'use strict';
    var deferred = Q.defer();
    var limit = parseInt(query.limit) || 20,
    queryUrl = cmsData.search.url + query.q + '?page[size]=' + limit;

    if (query.offset) {
        queryUrl += '&';
        var currentPage = query.offset / limit + 1;
        queryUrl += 'page[number]=' + currentPage;
    }
    helper.getApiData(queryUrl, function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(new Error(err));
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(new Error(err));
        }
    });
    return deferred.promise;
}
