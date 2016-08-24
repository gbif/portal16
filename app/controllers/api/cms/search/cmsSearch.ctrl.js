'use strict';
var express = require('express'),
    router = express.Router(),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/cmsData/apiConfig'),
    cmsData = require('../../../../models/cmsData/cmsData'),
    log = require('../../../../../config/log');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/cms/search', function (req, res, next) {
    cmsSearch(req.query).then(function(data) {
        if (data.hasOwnProperty('facets')) {
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
                        facet.counts.forEach(function(count){
                            switch (facet.field) {
                                case 'type':
                                    count.facetLabel = res.__('cms.type.' + count.enum);
                                    break;
                                case 'language':
                                    count.facetLabel = res.__('language.' + count.enum);
                                    break;
                                case 'category_country':
                                    count.facetLabel = res.__('country.' + count.enum);
                                    break;
                                default:
                                    count.facetLabel = res.__('cms.filter.' + count.enum);
                                    break;
                            }
                        });
                    });
                }
            });
        }
        res.json(data);

    }, function(err){
        log.error('Error in /api/cms/search controller: ' + err.message);
        res.status(500).json({
            endpoint: '/api/cms/search',
            statusCode: 500,
            errorType: err.message
        });
    });
});

function cmsSearch(query) {
    'use strict';
    var deferred = Q.defer();
    var limit = parseInt(query.limit) || 20;
    var queryUrl = apiConfig.search.url;
    queryUrl += (typeof query.q === 'undefined') ? '' : query.q;
    queryUrl += '?page[size]=' + limit;

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
