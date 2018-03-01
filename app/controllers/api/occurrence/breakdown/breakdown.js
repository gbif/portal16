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
    // get fill response
    let response = await getData(query);

    // If the user has asked to select only a few values, then remove the unwanted
    if (query.pick) {
        response.results.forEach(function(e) {
            if (e._resolved) {
                e._resolved = _.pick(e._resolved, query.pick);
            }
        });
    }
    // if user has decided to omit certain field, then remove those from the response.
    if (query.omit) {
        response.results.forEach(function(e) {
            if (e._resolved) {
                e._resolved = _.omit(e._resolved, query.omit);
            }
        });
    }
    // if no explicit filters - then use the name field instead.
    response.results.forEach(function(e) {
        if (!e.filter) {
            let filter = {};
            filter[response.field] = e.name;
            e.filter = filter;
        }
        if (!e.displayName) {
            e.displayName = e.name;
        }
        delete e.name;
    });
    return response;
}

async function getData(query) {
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
