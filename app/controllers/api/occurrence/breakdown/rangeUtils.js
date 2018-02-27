/**
 * Created by mortenhofft on 24/02/18.
 */
'use strict';

let _ = require('lodash'),
    request = require('requestretry'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    facetConfig = require('./config'),
    changeCase = require('change-case'),
    wkt2geojson = require('wellknown'),
    turf = require('turf'),
    log = require('../../../../../config/log');

module.exports = {
    getMinMaxRange: getMinMaxRange,
    getRanges: getRanges,
    getRangedFacets: getRangedFacets,
    query: query
};

function getMinMaxRange(query, field) {
    // query is the full query - field is the field to 'facet' on
    // analyze to find the possible minimum and maximum values.
    // this means that if a user has selected two non-consecutuve ranges, then the faceted range will also give results for the area in between.
    // This is not the case for geometries, where there are two parameters to work with. And since geometry is used by the portal, that leaves decimal latitude to filter on top of the geometry
    // probably ought to do an intersection on the geometries instead though - that will allow adding it as a filter. - silly do so in the query it is only for the shown linkable filter.

    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    let minMax;
    if (field !== 'decimalLatitude') {
        minMax = getMinMaxNumber(undefined, field);
        let values = _.concat([], query[field] || []);
        values.forEach(function(value) {
            minMax = getMinMaxNumber(value, field);
        });
    } else {
        minMax = getMinMaxGeometry(undefined, field);
        let values = _.concat([], query.geometry || []);
        values.forEach(function(value) {
            minMax = getMinMaxGeometry(value, field);
        });
    }

    min = Math.min(minMax.min, min);
    max = Math.max(minMax.max, max);

    return {
        min: min,
        max: max
    };
}

function getMinMaxNumber(value, field) {
    // query is either array or string - field is the field to 'facet' on
    // analyze to find the possible minimum and maximum values including all relevant fields
    // ex ["2002,*", "1980"] has a minimum of 1980 and a max:todays year
    let constantField = changeCase.constantCase(field);
    let max = _.get(facetConfig.fields[constantField], 'range.max', 100);
    let min = _.get(facetConfig.fields[constantField], 'range.min', 0);

    if (typeof value !== 'undefined') {
        let parts = value.toString().split(',');
        let tmpMin = _.toNumber(parts[0]);
        if (!isNaN(tmpMin)) {
            min = tmpMin;
        }
        if (parts.length === 2) {
            let tmpMax = _.toNumber(parts[1]);
            if (!isNaN(tmpMax)) {
                max = tmpMax;
            }
        } else {
            max = min;
        }
    }
    return {
        min: min,
        max: max
    };
}


function getMinMaxGeometry(value, field) {
    // ex: ["polygon((...))] would use a lib to determine the bounding box and set min max latitude from that.
    if (typeof value !== 'undefined') {
        let geo = wkt2geojson(value);
        let bbox = turf.bbox(geo);
        return {
            min: bbox[1],
            max: bbox[3]
        };
    } else {
        let constantField = changeCase.constantCase(field);
        return {
            min: facetConfig.fields[constantField].range.min,
            max: facetConfig.fields[constantField].range.max
        };
    }
}

function getRanges(field, minMax, buckets) {
    // based on the field type and minimum resolution and min max values returns an array with min max values
    // let range = ['1900,1910', '1910,1920', '1920,1930', '1930,1940'];
    let constantField = changeCase.constantCase(field);
    let bucketSizeVaries = false;

    let bucketSize = (minMax.max - minMax.min) / buckets;
    let isIntegerRange = facetConfig.fields[constantField].range.type === 'INT';
    if (isIntegerRange) {
        bucketSize = Math.ceil(bucketSize);
        bucketSize = Math.max(1, bucketSize);
    }
    bucketSize = Math.max(0.00001, bucketSize);
    bucketSize = +bucketSize.toFixed(5);
    let range = isIntegerRange ? _.range(minMax.min, minMax.max + 1, bucketSize ) : _.range(minMax.min, minMax.max, bucketSize );
    range = range.map(function(b) {
        let start = +b.toFixed(5);
        let end = start + bucketSize;
        if (isIntegerRange) {
            end -= 1; // To ensure non overlapping ranges. the n,m range notation used by the API is both inclusive.
        }
        bucketSizeVaries = bucketSizeVaries || minMax.max < end;
        end = Math.min(minMax.max, end);// should never be larger than maximum configured for the range. This can happen if we e.g. split 12 months into 5 buckets
        end = +(end).toFixed(5);
        return start + ',' + end;
    });
    return {
        range: range,
        bucketSizeVaries: bucketSizeVaries
    };
}

async function getRangedFacets(query, range, field) {
    let promises = range.map(function(interval) {
        let values = {limit: 0, offset: 0};
        values[field] = interval;
        let q = _.assign({}, query, values);
        delete q.facet;
        delete q.facetLimit;
        delete q.facetOffset;
        delete q.dimension;
        delete q.bucket;
        return getInterval(q);
    });

    let rangeList = await Promise.all(promises);
    return rangeList.map(function(response, i) {
        return {
            count: response,
            name: range[i]
        };
    });
}

async function getInterval(query) {
    let options = {
        url: apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query),
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body.count;
}

function composeResult(offset, limit, dimension, results, ranges, bucketSizeVaries) {
    let max = _.maxBy(results, 'count').count;
    let min = _.minBy(results, 'count').count;
    return {
        results: results,
        field: dimension, // TODO transform to enum type
        limit: limit,
        offset: offset,
        endOfRecords: ranges.length <= offset + limit,
        bucketSizeVaries: bucketSizeVaries,
        max: max,
        min: min
    };
}

function addGeometryFilter(query, results) {
    // check if there is anything to intersect with
    let geomFilters = query.geometry;

    if (query.dimension === 'decimalLatitude') {
        results.forEach(function(e) {
            // for all results add a geom filter corresponding to the count
            let filter = [];
            let minMax = getMinMaxNumber(e.name, 'decimalLatitude');

            if (!geomFilters) {
                filter.push(`POLYGON ((-180 ${minMax.min}, -180 ${minMax.max}, 180 ${minMax.max}, 180 ${minMax.min}, -180 ${minMax.min}))`);
            } else {
                geomFilters = _.isString(geomFilters) ? [geomFilters] : geomFilters;
                let slicer = `POLYGON ((-180 ${minMax.min}, -180 ${minMax.max}, 180 ${minMax.max}, 180 ${minMax.min}, -180 ${minMax.min}))`;
                let polySlicer = wkt2geojson(slicer);
                geomFilters.forEach(function(e) {
                    let geom = wkt2geojson(e);
                    let intersection = turf.intersect(geom, polySlicer);
                    let wkt = wkt2geojson.stringify(intersection);
                    if (wkt.startsWith('MULTIPOLYGON')) {
                        let polys = wkt.match(/\(\([0-9,\.\-\s]+\)\)/g);
                        for (let i = 0; i < polys.length; i++) {
                            filter.push(`POLYGON ${polys[i]}`);
                        }
                    } else {
                        filter.push(wkt);
                    }
                });
            }

            e.filter = filter;
        });
    }
}

async function query(query) {
    // TODO sanitize input values to type and accepted values
    let dimension = query.dimension;
    let buckets = query.buckets || 10; // Number of 'AUTO' a desired bucket count. this will only be used as a guide as their are minimum resolutions
    let limit = query.limit || 10;
    let offset = query.offset || 0;

    let minMax = getMinMaxRange(query, dimension);
    let rangeOptions = getRanges(dimension, minMax, buckets);
    let ranges = rangeOptions.range;
    let bucketSizeVaries = rangeOptions.bucketSizeVaries;
    let queriedRange = ranges.slice(offset, offset + limit);
    let facets = await getRangedFacets(query, queriedRange, dimension);
    let responseBody = composeResult(offset, limit, dimension, facets, ranges, bucketSizeVaries);
    addGeometryFilter(query, responseBody.results);
    return responseBody;
}

let t = 'POLYGON ((-73.828125 56.9449741808516, 79.453125 -48.45835188280864, 84.375 -42.03297433244139, -66.796875 60.58696734225869, -73.828125 56.9449741808516))';
let t1 = 'POLYGON ((-73.828125 56.9449741808516, 79.453125 -48.45835188280864, 84.375 -42.03297433244139, -66.796875 60.58696734225869, -73.828125 56.9449741808516))';
let t2 = 'POLYGON ((73.125 62.91523303947614, 75.234375 58.81374171570782, -61.87499999999999 -57.70414723434192, -64.6875 -51.618016548773696, 30.234375 37.16031654673677, -2.8125 62.2679226294176, 7.734374999999999 62.59334083012024, 31.640625 45.583289756006316, 73.125 62.91523303947614))';
// query({dimension: 'decimalLatitude', geometry: [t1, t2], Xyear: ['1980,1997', '1978'], XtaxonKey: 1080, limit: 10, offset: 0, buckets: 10});

// var a = 'POLYGON ((-218.671875 10.487811882056695, -218.671875 59.17592824927136, -133.59375 59.17592824927136, -133.59375 10.487811882056695, -218.671875 10.487811882056695))';
// // var b = 'POLYGON ((-180 38, -180 46, 180 46, 180 38, -180 38))';
// var b = 'POLYGON ((-180 38, -180 46, 180 46, 180 38, -180 38))';
// var poly1 = wkt2geojson(a);
// var poly2 = wkt2geojson(b);
// var intersection = turf.intersect(poly1, poly2);
// console.log(wkt2geojson.stringify(intersection));
