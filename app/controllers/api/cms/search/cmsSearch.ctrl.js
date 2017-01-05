'use strict';
var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/cmsData/apiConfig'),
    cmsData = require('../../../../models/cmsData/cmsData'),
    Utilities = require('../cmsUtilities'),
    log = require('../../../../../config/log');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/cms/search', function (req, res, next) {
    cmsSearch(req.query)
        .then(function (data) {
            if (data.hasOwnProperty('facets')) {
                return data;
            }
            else if (data.hasOwnProperty('filters')) {
                data.facets = data.filters;
                return data;
            }
            else {
                next('Neither facets nor filters exists.');
            }
        })
        .then(function(data){
            // verifying data before passing along
            if (cmsData.verifyCmsFacets(data.facets)) {
                return data;
            }
            else {
                next('Facets not in the correct format.');
            }
        })
        .then(function (data) {
            try {
                cmsData.expandFacets(data.facets, res.__);
                transformFacetsToMap(data);
                // Add URL prefix
                addContentTypeUrlPrefix(data);
                res.json(data);
            } catch (e) {
                next(e);
            }
        })
        .catch(function (err) {
            log.error('Error in /api/cms/search controller: ' + err.message);
            next(err)
        });

});

function cmsSearch(query) {
    var deferred = Q.defer();
    query = Utilities.queryTransform(query);

    var queryUrl = apiConfig.search.url;
    queryUrl += (typeof query.q === 'undefined') ? '' : query.q;
    queryUrl += '?range=' + query.range;
    queryUrl += '&page=' + query.page;
    if (query.type && query.type === 'event') {
        queryUrl += '&sort=-dateStart';
    }
    else {
        queryUrl += '&sort=-created';
    }

    // @todo handling event filtering queries, e.g.
    // http://cms.gbif-dev.org/api/v2/search?filter[type]=event&filter[ge_date_ical:value][value]=1470000000&filter[ge_date_ical:value][operator]=">"

    // Converting facets in the array notation that the CMS API consumes.
    var availableFacets = [
        'type',
        'language',
        'category_data_use',
        'category_capacity_enhancement',
        'category_about_gbif',
        'category_audience',
        'category_purpose',
        'category_country',
        'category_topic',
        'category_literature_year',
        'category_gbif_literature_annotation',
        'category_author_from_country',
        'category_author_surname'
    ];
    var resource_type_id = {
        'document': '895',
        'presentation': '987',
        'tool': '1010',
        'link': '1076'
    };

    // Convert resource_type to type.
    availableFacets.forEach(function (facet) {
        if (typeof query[facet] !== 'undefined') {
            if (facet == 'type' && ['document', 'presentation', 'tool', 'link'].indexOf(query[facet]) !== -1) {
                queryUrl += '&' + 'filter[category_resource_type]=' + resource_type_id[query[facet]];
            }
            else if (typeof query[facet] === 'object') {
                query[facet].forEach(function (tid) {
                    queryUrl += '&' + 'filter[' + facet + ']=' + tid;
                });
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

function addContentTypeUrlPrefix(data) {
    if (data.results) {
        data.results.forEach(function (result) {
            result.contentTypeUrlPrefix = (result.type == 'gbif_participant') ? result.type.replace('gbif_', '') : result.type.replace('_', '-');
        });
    }
}

// @todo merge into cmsData.expandFacets()
function transformFacetsToMap(data) {
    if (!_.isArray(data.facets)) {
        return
    }
    let facets = {};
    data.facets.forEach(function (e) {
        facets[e.field] = e.counts;
        facets[e.field]['translatedLabel'] = e.translatedLabel;
        facets[e.field]['fieldKey'] = e.field;
    });
    data.facets = facets;

    let facetMap = {};
    let countryFields = [
        'category_country',
        'category_author_from_country'
      ];
    Object.keys(data.facets).forEach(function (key) {
        let facetType = data.facets[key];
        facetMap[key] = {};
        let max = 0;
        facetMap[key].counts = [];
        facetType.forEach(function (e) {
            facetMap[key].counts.push({
                count: e.count,
                fraction: e.count / data.count === 0 ? 1 : data.count,
                translatedLabel: e.translatedLabel,
                key: countryFields.indexOf(key) !== -1 ? e.enum : e.key
            });
            max = e.count > max ? e.count : max;
        });
        facetMap[key].max = max;
        facetMap[key].fieldKey = facetType.fieldKey;
        facetMap[key].translatedLabel = facetType.translatedLabel;

        // CMS API by default has filters sorted by counts,
        // we sort them by name here, except country, so it behaves closer to GBIF Data API.
        /*
        facetMap[key].counts.sort(function (a, b) {
            if (a.translatedLabel > b.translatedLabel) return 1;
            if (a.translatedLabel < b.translatedLabel) return -1;
        });
        */
        // Year is sorted by label
        if (key == 'category_literature_year') {
            facetMap[key].counts.sort(function (a, b) {
                if (a.translatedLabel > b.translatedLabel) return -1;
                if (a.translatedLabel < b.translatedLabel) return 1;
            });
        }

        if (countryFields.indexOf(key) !== -1) {
            facetMap[key].counts.sort(function (a, b) {
                if (a.count > b.count) return -1;
                if (a.count < b.count) return 1;
            });
            // only show the first ten.
            facetMap[key].counts.splice(10);
        }
        // Push 'und' to the last for language facet.
        if (key == 'language') {
            facetMap[key].counts.forEach(function (count, i) {
                if (count.key == 'und') {
                    facetMap[key].counts = facetMap[key].counts.concat(facetMap[key].counts.splice(i, 1));
                }
            });
        }
        // Sort content type filters by count
        if (key == 'type') {
            facetMap[key].counts.sort(function (a, b) {
                if (a.count > b.count) return -1;
                if (a.count < b.count) return 1;
            });
        }
    });
    data.facets = facetMap;
}