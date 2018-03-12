'use strict';
let plainFacet = require('./occurrenceFacet');
let rangeFacets = require('./rangeUtils');
let changeCase = require('change-case');
let _ = require('lodash');
let objectHash = require('object-hash');
let facetConfig = require('./config');
let chai = require('chai');
let expect = chai.expect;

module.exports = {
    query: query,
    parseQuery: parseQuery
};

async function query(query) {
    // get fill response
    let result = await getFormatedData(query);
    if (query.secondDimension) {
        result = await addSecondDimension(result, query);
    }
    return result;
}

async function addSecondDimension(data, query) {
    expect(query.secondDimension).to.be.a('string', 'Dimension must be a string');
    let constantSecondDimension = changeCase.constantCase(query.secondDimension);
    expect(facetConfig.fields[constantSecondDimension]).to.be.an('object', 'There must exist a configuration for the dimension');
    let isTypeEnumOrRange = facetConfig.fields[constantSecondDimension].type === facetConfig.type.ENUM || !!facetConfig.fields[constantSecondDimension].range;
    expect(isTypeEnumOrRange).to.equal(true, 'Second dimension must be an low cardinality enum');
    query.buckets = query.buckets || 10;

    if (query.secondDimension == 'month') {
        query.fillEnums = true;
        query.buckets = undefined;
    }
    if (query.secondDimension == 'decimalLatitude' || query.secondDimension == 'year' || query.secondDimension == 'elevation') {
        query.fillEnums = false;
        query.buckets = query.buckets || 10;
    }

    let dimensionPromises = data.results.map(function(e) {
        let mergedQuery = _.assign({}, query, e.filter, {dimension: query.secondDimension, limit: 1000, offset: 0});
        return getFormatedData(mergedQuery);
    });
    let secondDimensionData = await Promise.all(dimensionPromises);
    // Get union of secondary categories and filters
    let categories = {};
    let max = Number.MIN_SAFE_INTEGER;
    let min = Number.MAX_SAFE_INTEGER;
    secondDimensionData.forEach(function(a) {
        a.results.forEach(function(b) {
            let key = objectHash(b.filter);
            max = Math.max(max, b.count);
            min = Math.min(min, b.count);
            b.key = key;
            categories[key] = categories[key] || {filter: b.filter, displayName: b.displayName, key: b.key, count: 0};
            categories[key].count += b.count;
        });
        a.results = _.keyBy(a.results, 'key');
    });
    categories = _.values(categories);

    // map secondary dimension to array on results
    data.results.forEach(function(e, i) {
        let results = secondDimensionData[i].results;
        e.values = categories.map(function(c) {
            return _.get(results[c.key], 'count', 0);
        });
        e.diff = e.count - _.sum(e.values);
    });

    categories.forEach(function(e) {
       delete e.key;
    });

    data.max = max;
    data.min = min;
    data.secondField = changeCase.snakeCase(query.secondDimension);

    data.categories = categories;
    return data;
}

async function getFormatedData(query) {
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
    query.fillEnums = query.fillEnums === 'true' || query.fillEnums === true;
    return query;
}
