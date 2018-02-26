'use strict';
let plainFacet = require('./occurrenceFacet');
let rangeFacets = require('./rangeUtils');
let changeCase = require('change-case');
let _ = require('lodash');
let facetConfig = require('./config');
let chai = require('chai');
let expect = chai.expect;

module.exports = {
    query: query,
    parseQuery: parseQuery
};

async function query(query) {
    expect(query).to.be.an('object', 'Query param expected to be an object');
    expect(query.dimension).to.be.a('string', 'Dimension must be a string');

    let constantDimension = changeCase.constantCase(query.dimension);
    expect(facetConfig.fields[constantDimension]).to.be.an('object', 'There must exist a configuration for the dimension');

    // Make sure numbers are numbers and not string (as they are when calling using an URL)
    query = parseQuery(query);

    // If asking for range bucketing and it is supported
    if (query.buckets && facetConfig.fields[constantDimension].range) {
        return rangeFacets.query(query);
    } else {
        return plainFacet.query(query);
    }
}

function parseQuery(query) {
    // cast to appropriate types. limit should be an integer fx
    if (query.limit) {
        query.limit = _.toSafeInteger(query.limit);
        query.offset = _.toSafeInteger(query.offset);
    }
    return query;
}
