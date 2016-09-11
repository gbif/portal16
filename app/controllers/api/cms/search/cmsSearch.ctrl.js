'use strict';
var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/cmsData/apiConfig'),
    cmsData = require('../../../../models/cmsData/cmsData'),
    log = require('../../../../../config/log');

var resource_type = {
    '895': 'document',
    '987': 'presentation',
    '1010': 'tool',
    '1076': 'link'
};

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/cms/search', function (req, res) {
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

                    // merge category_resource_type filters with type filters
                    var index_type, index_category_resource_type;
                    data.facets.forEach(function(facet, fi){
                        switch (facet.field) {
                            case 'type':
                                index_type = fi;
                                break;
                            case 'category_resource_type':
                                index_category_resource_type = fi;
                                break;
                        }
                        facet.counts.forEach(function(count, ci){
                            // Strip type:resource filter for less confusion
                            if (count.key == 'resource') {
                                facet.counts.splice(ci, 1);
                            }
                        });
                    });
                    data.facets[index_type].counts = data.facets[index_type].counts.concat(data.facets[index_category_resource_type].counts);
                    data.facets.splice(index_category_resource_type, 1);


                    data.facets.forEach(function(facet){
                        facet.fieldLabel = res.__('cms.facet.' + facet.field);
                        facet.counts.forEach(function(count){
                            switch (facet.field) {
                                case 'type':
                                    count.facetLabel = res.__('cms.type.' + count.enum);
                                    if ([895, 987, 1010, 1076].indexOf(count.key) !== -1) {
                                        count.key = resource_type[count.key];
                                    }
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
        transformFacetsToMap(data);
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
    var availableFacets = ['type', 'language', 'category_data_use', 'category_capacity_enhancement', 'category_about_gbif', 'category_audience', 'category_purpose', 'category_data_type', 'category_country', 'category_topic', 'category_tags'];
    var resource_type_id = {
        'document': '895',
        'presentation': '987',
        'tool': '1010',
        'link': '1076'
    };

    availableFacets.forEach(function(facet){
        if (typeof query[facet] !== 'undefined') {
            if (facet == 'type' && ['document', 'presentation', 'tool', 'link'].indexOf(query[facet]) !== -1) {
                queryUrl += '&' + 'filter[category_resource_type]=' + resource_type_id[query[facet]];
            }
            else {
                queryUrl += '&' + 'filter[' + facet + ']=' + query[facet];
            }
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



function transformFacetsToMap(data) {
    if (!_.isArray(data.facets)) {
        return
    }
    let facets = {};
    data.facets.forEach(function (e) {
        facets[e.field] = e.counts;
    });
    data.facets = facets;

    let facetMap = {};
    Object.keys(data.facets).forEach(function(key){
        let facetType = data.facets[key];
        facetMap[key] = {};
        let facetCountMap = {};
        let max = 0;
        facetType.forEach(function(e){
            facetCountMap[e.enum] = {
                count: e.count,
                fraction: e.count/data.count,
                title: e.title
            };
            max = e.count > max ? e.count : max;
        });
        facetMap[key].max = max;
        facetMap[key].counts = facetCountMap;
    });
    data.facets = facetMap;
}
