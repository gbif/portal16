'use strict';
var express = require('express'),
    router = express.Router(),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/cmsData/apiConfig'),
    cmsData = require('../../../../models/cmsData/cmsData');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/cms/search', function (req, res, next) {
    cmsSearch(req.query).then(function(data) {
        cmsData.expandFacets(data.facets, res.__, function(err){
            if (err) {
                //TODO handle expansion errors
                res.json(data);

            } else {

                // Duplicate the machine name so the sorting of facet groups can happen in the front end.
                data.facets = data.facets.filter(function(e){
                    if (e.field == 'category_informatics') return false;
                    if (e.field == 'category_tags') return false;
                    if (e.field == 'category_data_type') return false;
                    return true;
                });
                data.facets.forEach(function(facet){
                    facet.fieldLabel = res.__('cms.facet.' + facet.field);
                });
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

function cmsSearch(query) {
    'use strict';
    var deferred = Q.defer();
    var limit = parseInt(query.limit) || 20,
    queryUrl = apiConfig.search.url + query.q + '?page[size]=' + limit;

    if (query.offset) {
        queryUrl += '&';
        var currentPage = query.offset / limit + 1;
        queryUrl += 'page[number]=' + currentPage;
    }

    // Converting facets in the array notation that the CMS API consumes.
    var availableFacets = ['type', 'language', 'category_data_use', 'category_capacity_enhancement', 'category_about_gbif', 'category_audience', 'category_purpose', 'category_data_type', 'category_resource_type', 'category_country', 'category_topic', 'category_tags'];
    availableFacets.forEach(function(facet){
        if (typeof query[facet] !== 'undefined') {
            queryUrl += '&' + 'filter[' + facet + ']=' + query[facet];
        }
    });

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
