'use strict';

let i18n = require('../../../../config/i18n'),
    _ = require('lodash'),
    config = require('config'),
    request = require('requestretry');

module.exports = {
    expandFacets: expandFacets
};

/**
 * iteratue all facets types and facets and expand enums with their translation and keys with their scientificName/title etc.
 * @param facets a list of facets from an occurrence search
 */
async function expandFacets(facets, __, includeFullObject) {
    __ = __ || i18n.__;
    includeFullObject = includeFullObject || false;
    let facetPromises = facets.map(function(facet) {
        return expandFacet(facet, __, includeFullObject);
    });
    let f = await Promise.all(facetPromises);
    return f;
}

async function expandFacet(facet, __, includeFullObject) {
    // if enum then look up value
    // else get item from API
    if (!_.has(config.fields[facet.field], 'type')) {
        // throw 'No such facet type configured';
        // default to raw
        config.fields[facet.field] = {type: config.type.RAW};
    }


    // preprocess
    if (config.fields[facet.field].ordering === 'NUMERIC') {
        facet.counts = _.sortBy(facet.counts, function(e) {
            return _.toSafeInteger(e.name);
        });
    }
    if (config.fields[facet.field].prune) {
        _.remove(facet.counts, config.fields[facet.field].prune);
    }

    // resolve names
    if (config.fields[facet.field].type == config.type.RAW) {
        facet.counts.forEach(function(f) {
            f.displayName = f.name;
        });
        return facet;
    } else if (config.fields[facet.field].type == config.type.ENUM) {
        facet.counts.forEach(function(f) {
            let translationPath = config.fields[facet.field].translationPath.replace('{VALUE}', f.name);
            f.displayName = __(translationPath);
        });
        return facet;
    } else if (config.fields[facet.field].type == config.type.KEY) {
        let facetPromises = facet.counts.map(function(item) {
            return addResolveUrl(item, config.fields[facet.field], includeFullObject);
        });
        await Promise.all(facetPromises);
        return facet;
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
