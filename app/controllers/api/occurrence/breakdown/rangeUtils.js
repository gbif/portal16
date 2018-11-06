/**
 * Created by mortenhofft on 24/02/18.
 */
'use strict';

let _ = require('lodash'),
    request = rootRequire('app/helpers/request'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    facetConfig = require('./config'),
    changeCase = require('change-case'),
    wkt2geojson = require('wellknown'),
    turf = require('@turf/turf'),
    Promise = require('bluebird');

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
            min = Math.min(minMax.min, min);
            max = Math.max(minMax.max, max);
        });
    } else {
        minMax = getMinMaxGeometry(undefined, field);
        let values = _.concat([], query.geometry || []);
        values.forEach(function(value) {
            minMax = getMinMaxGeometry(value, field);
            min = Math.min(minMax.min, min);
            max = Math.max(minMax.max, max);
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

    let diff = minMax.max - minMax.min;
    let bucketSize = diff / buckets;

    // an attempt to set buckets size to nice values (0.1 instead of 0.1043429) whilst keeping bucket count to around 10;
    if (diff > 0.0000001) {
        let b = 10000;
        while (diff <= b) {
            b /= 10;
        }
        b /= 10;
        if (diff / b > 20) b *= 5;
        if (diff / b > 15) b *= 2;
        if (diff / b < 3) b /= 5;
        if (diff / b < 5) b /= 2;
        b = +b.toFixed(5);
        bucketSize = b;
    }

    let isIntegerRange = facetConfig.fields[constantField].range.type === 'INT';
    if (isIntegerRange) {
        bucketSize = Math.ceil(bucketSize);
        bucketSize = Math.max(1, bucketSize);
    }
    bucketSize = Math.max(0.00001, bucketSize);
    bucketSize = +bucketSize.toFixed(5);
    let range = isIntegerRange ? _.range(minMax.min, minMax.max + 1, bucketSize ) : _.range(minMax.min, minMax.max, bucketSize );
    range = _.map(range, function(e) {
        return +e.toFixed(5);
    });
    range = range.map(function(b) {
        let start = b;
        let end = start + bucketSize;
        if (isIntegerRange) {
            end -= 1; // To ensure non overlapping ranges. the n,m range notation used by the API is both inclusive.
        }
        bucketSizeVaries = bucketSizeVaries || end - minMax.max > 0.0001;
        end = Math.min(minMax.max, end);// should never be larger than maximum configured for the range. This can happen if we e.g. split 12 months into 5 buckets
        end = +(end).toFixed(5);
        return {
            start: start,
            end: end
        };
    });

    if (!isIntegerRange) {
        _.remove(range, function(e) {
            return e.start === e.end;
        });
    }

    range.forEach(function(b) {
       if (b.start !== b.end) {
        b.filter = b.start + ',' + b.end;
       } else {
        b.filter = b.start;
       }
    });

    return {
        range: range, // .reverse(), // overall not reversing seems more intuitive. for decimal latitude and a table view it is different though
        bucketSizeVaries: bucketSizeVaries,
        bucketSize: bucketSize
    };
}

async function getRangedFacets(query, range, field) {
    let rangeList = await Promise.map(range, function(interval) {
        let values = {limit: 0, offset: 0};
        values[field] = interval.filter;
        let q = _.assign({}, query, values);
        delete q.facet;
        delete q.facetLimit;
        delete q.facetOffset;
        delete q.dimension;
        delete q.bucket;
        return getInterval(q);
    }, {concurrency: 2});

    return rangeList.map(function(response, i) {
        return {
            count: response,
            name: range[i].filter
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

function composeResult(offset, limit, dimension, results, ranges, bucketSizeVaries, bucketSize, totalCount) {
    let max = _.maxBy(results, 'count').count;
    let min = _.minBy(results, 'count').count;
    return {
        results: results,
        field: changeCase.snakeCase(dimension),
        limit: limit,
        offset: offset,
        endOfRecords: ranges.length <= offset + limit,
        bucketSizeVaries: bucketSizeVaries,
        bucketSize: bucketSize,
        max: max,
        min: min,
        resultsCount: _.sumBy(results, 'count'),
        total: totalCount
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
                filter.push(`POLYGON ((-180 ${minMax.max}, -180 ${minMax.min}, 180 ${minMax.min}, 180 ${minMax.max}, -180 ${minMax.max}))`);
            } else {
                geomFilters = _.isString(geomFilters) ? [geomFilters] : geomFilters;
                let slicer = `POLYGON ((-360 ${minMax.max}, -360 ${minMax.min}, 360 ${minMax.min}, 360 ${minMax.max}, -360 ${minMax.max}))`;
                let polySlicer = wkt2geojson(slicer);
                geomFilters.forEach(function(e) {
                    let geom = wkt2geojson(e);
                    let intersection = turf.intersect(geom, polySlicer);
                    if (intersection) {
                        turf.rewind(intersection, {mutate: true, reverse: false});
                        let wkt = wkt2geojson.stringify(intersection);
                        if (wkt.startsWith('MULTIPOLYGON')) {
                            let polys = wkt.match(/\(\([0-9,.\-\s]+\)\)/g);
                            for (let i = 0; i < polys.length; i++) {
                                filter.push(`POLYGON ${polys[i]}`);
                            }
                        } else {
                            filter.push(wkt);
                        }
                    }
                });
                if (filter.length == 0) {
                    // add slicer as there was no intersections - but this isnt right - it should return zero results but with no filter i guess? blocked somehow.
                    // geometry and not georeferenced as filter perhaps? weird
                    filter.push(slicer);
                }
            }

            e.filter = {
                geometry: filter
            };
        });
    }
}

async function query(query) {
    // TODO sanitize input values to type and accepted values
    let dimension = query.dimension;
    let buckets = query.buckets || 10; // Number of 'AUTO' a desired bucket count. this will only be used as a guide as their are minimum resolutions
    let limit = query.rangeLimit || 1000;
    let offset = query.rangeOffset || 0;

    // get all data to provide a total count
    let q = _.assign({}, query);
    delete q.facet;
    delete q.facetLimit;
    delete q.facetOffset;
    delete q.dimension;
    delete q.bucket;
    q.limit = 0;
    let totalCount = await getInterval(q);

    let minMax = getMinMaxRange(query, dimension);
    let rangeOptions = getRanges(dimension, minMax, buckets);
    let ranges = rangeOptions.range;
    let bucketSizeVaries = rangeOptions.bucketSizeVaries;
    let queriedRange = ranges.slice(offset, offset + limit);
    let facets = await getRangedFacets(query, queriedRange, dimension);
    let responseBody = composeResult(offset, limit, dimension, facets, ranges, bucketSizeVaries, rangeOptions.bucketSize, totalCount);
    addGeometryFilter(query, responseBody.results);
    return responseBody;
}

