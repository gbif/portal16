'use strict';

let i18n = require('../../../../../config/i18n'),
    _ = require('lodash'),
    config = require('./config'),
    request = require('requestretry');

module.exports = {
    expandFacets: expandFacets,
    expand: expand
};

/**
 * iteratue all facets types and facets and expand enums with their translation and keys with their scientificName/title etc.
 * @param facets a list of facets from an occurrence search
 */
async function expandFacets(facets, __, includeFullObject) {
    __ = __ || i18n.__;
    includeFullObject = includeFullObject || false;
    let facetPromises = facets.map(function(facet) {
        return expand(facet, __, includeFullObject);
    });
    let f = await Promise.all(facetPromises);
    return f;
}

async function expand(responseBody, __, includeFullObject) {
    __ = __ || i18n.__;
    // if enum then look up value
    // else get item from API
    if (!_.has(config.fields[responseBody.field], 'type')) {
        // throw 'No such facet type configured';
        // default to raw
        config.fields[responseBody.field] = {type: config.type.RAW};
    }

    // Preprocess
    // Notice that sorting makes little sense if the list isn't exhaustive
    if (config.fields[responseBody.field].ordering === 'NUMERIC') {
        responseBody.results = _.sortBy(responseBody.results, function(e) {
            return _.toSafeInteger(e.name);
        });
    }
    if (config.fields[responseBody.field].prune) {
        _.remove(responseBody.results, config.fields[responseBody.field].prune);
    }

    // resolve names
    if (config.fields[responseBody.field].type == config.type.RAW) {
        responseBody.results.forEach(function(f) {
            f.displayName = f.name;
        });
        return responseBody;
    } else if (config.fields[responseBody.field].type == config.type.ENUM) {
        responseBody.results.forEach(function(f) {
            let translationPath = config.fields[responseBody.field].translationPath.replace('{VALUE}', f.name);
            f.displayName = __(translationPath);
        });
        return responseBody;
    } else if (config.fields[responseBody.field].type == config.type.KEY) {
        let facetPromises = responseBody.results.map(function(item) {
            return addResolveUrl(item, config.fields[responseBody.field], includeFullObject);
        });
        await Promise.all(facetPromises);
        return responseBody;
    }
}

async function addResolveUrl(item, conf, includeFullObject) {
    let url = conf.url.replace('{VALUE}', item.name);
    let options = {
        url: url,
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw 'failed to get key';
    }
    item.displayName = _.get(response, 'body.' + conf.field, 'Unknown');
    if (includeFullObject) {
        item._resolved = response.body;
    }
    return item;
}
