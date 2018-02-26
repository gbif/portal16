/**
 * Created by mortenhofft on 24/02/18.
 */
'use strict';

let _ = require('lodash'),
    request = require('requestretry'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    log = require('../../../../../config/log');

let defaultOptions = {
    facetLimit: 30,
    facetOffset: 0
};

async function facet(options, query) {
    //compose query
    //get data
    //decorate with actual objects or translations
    //optionally fill empty
    //decorate with analasus and transform tostandard format

    query = query || {};
    let dimensionA = options.dimensionA;
    let queryA = _.assign({}, defaultOptions, options, {limit: 0, facet: dimensionA});

    console.log(queryA);
    let data = await getData(queryA);

    console.log(data);

    let dimensionB = options.dimensionB;
    let fillEnums = options.fillEnums;


}

function composeQueryA(options, query) {
    //TODO expect dimensionA
    let facetLimit = query.limit || 20;
    let facetOffset = query.offset || 0;
    let q = _.assign({}, defaultOptions, options, {limit: 0, facetLimit: facetLimit, facetOffset: facetOffset, facet: options.dimensionA});
    q.facetLimit = q.facetLimit + 1; // always add one so we can tell the user if there are more facet they haven't seen
}

async function getData(query) {
    let options = {
        url: apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query),
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        log.warn({statusCode: response.statusCode, module: 'Occurrence facets', query: query}, response.body);
        throw new Error('Failed API query');
    }
    return response.body;
}

facet({dimensionA: 'basisOfRecord'}, {taxonKey: 256});
