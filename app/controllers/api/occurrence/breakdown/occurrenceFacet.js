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
    facetExpander = require('./facetExpander'),
    log = require('../../../../../config/log');

module.exports = {
    query: query
};

async function query(query, __) {
    // compose query
    // get data
    // optionally fill empty
    // decorate with actual objects or translations
    // decorate with analasus and transform tostandard format

    query = query || {};
    let queryA = composeQueryA(query);
    let responseBody = await getPlainFacets(queryA);
    responseBody = composeResult(queryA, responseBody);

    if (query.fillEnums === true) {
        responseBody.results = getFullResult(responseBody.results, responseBody.field);
    }

    responseBody = await facetExpander.expand(responseBody, __, true, query.prune === 'true');

    // If user have asked for a secondary dimension then expand that
    // if (query.dimensionB) {
    //     // Make sure dimensionB is an enum
    //     // This is required as it wouldn't make sense to show a table otherwise, there would very likely be cells we didn't have data on.
    //     if (facetConfig.fields[query.dimensionB].type !== facetConfig.type.ENUM) {
    //         throw new Error('Invalid secondary dimension. Must be an enumerated field.');
    //     }
    // }


    // hmm - for range fields like latitude but also elevation, depth, year it would make sense to split the query into fixed size buckets.
    // i imagine always splitting it into say 10 buckets within the known possible range.
    // if no limiting queries that is -90 to 90 for latitude.  Years could cap at today - 1000 years.
    // if there is a query, then adapt the ranges to that query. so if filtering on 1970-1980, then split in 10s in that interval (respecting a minimum size). If more q, then min max on total.
    // and more tricky if multiple geometry queries, then find bounding box and limit to that area.

    return responseBody;
}

function composeQueryA(query) {
    // TODO expect dimension
    // TODO limit values to positive integers
    // TODO parameterize defaults
    let facetLimit = query.limit || 10;
    let facetOffset = query.offset || 0;
    let q = _.assign({}, query, {limit: 0, offset: 0, facetLimit: facetLimit, facetOffset: facetOffset, facet: query.dimension});
    delete q.dimension;
    delete q.fillEnums;
    q.facetLimit = q.facetLimit + 1; // always add one so we can tell the user if there are more facet they haven't seen
    return q;
}

function composeResult(query, body) {
    let results = body.facets[0].counts.slice(0, query.facetLimit - 1);
    let max = _.maxBy(results, 'count');
    let min = _.minBy(results, 'count');
    // body.facets[0].counts = body.facets[0].counts.slice(0, query.facetLimit - 1).map(function(e) {
    //     return {_name: e.name, _count: e.count};
    // });
    return {
        results: results,
        field: changeCase.snakeCase(body.facets[0].field),
        limit: query.facetLimit - 1,
        offset: query.facetOffset,
        endOfRecords: body.facets[0].counts.length < query.facetLimit,
        max: max ? max.count : 0,
        min: min ? min.count : 0,
        total: body.count,
        resultsCount: _.sumBy(results, 'count')
    };
}

/**
 * Fill all faceted enums and not just those with a count above zero. E.g. January: 5, February: 0, March: 10, ... instead of March: 10, January: 5, [no February], ...
 * @param response object - results and configuration
 */
function getFullResult(results, field) {
    // Get the configuration for this queryed facet field
    let constantField = changeCase.constantCase(field);
    let conf = facetConfig.fields[constantField];
    if (!conf) {
        // ignore if the field is not configured to support it
        return results;
    }
    // if the configuration state that the field is an enum
    if (_.isArray(_.get(conf, 'enums'))) {
        // create a lookup map for the results
        let mappedFacets = _.keyBy(results, 'name');
        // fill a new map with all enum values defaulting to count zero
        let filled = conf.enums.map(function(e) {
            return {
                name: e,
                count: _.get(mappedFacets[e], 'count') || 0
            };
        });
        return filled;
    }
    return results;
}

async function getPlainFacets(query) {
    let options = {
        url: apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query),
        method: 'GET',
        maxAttempts: 1,
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        log.warn({statusCode: response.statusCode, module: 'Occurrence facets', url: options.url}, response.body);
        throw new Error('Failed API query');
    }
    return response.body;
}

// query({dimension: 'speciesKey', fillEnums: true, taxonKey: 44, limit: 15, offset: 0});
