'use strict';
var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/cmsData/apiConfig'),
    cmsData = require('../../../../models/cmsData/cmsData'),
    log = require('../../../../../config/log');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/cms/search', function (req, res) {
    cmsSearch(req.query)
    .then(function(data) {
        if (data.hasOwnProperty('facets')) {
            return data;
        }
        else {
            throw new Error();
        }
    })
    .then(function(data){
        try {
            cmsData.expandFacets(data.facets, res.__);
            return data;
        } catch(e) {
            next(e);
        }
    })
    .then(function(data){
        try {
            transformFacetsToMap(data);
        } catch(e) {
            next(e);
        }
        res.json(data);
    })
    .catch(function(err){
        log.error('Error in /api/cms/search controller: ' + err.message);
        next(err)
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
    var availableFacets = ['type', 'language', 'category_data_use', 'category_capacity_enhancement', 'category_about_gbif', 'category_audience', 'category_purpose', 'category_country', 'category_topic'];
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
                title: e.translatedLabel
            };
            max = e.count > max ? e.count : max;
        });
        facetMap[key].max = max;
        facetMap[key].counts = facetCountMap;
    });
    data.facets = facetMap;
}
