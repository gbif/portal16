'use strict';

let i18n = require('../../../../../config/i18n'),
    _ = require('lodash'),
    config = require('./config'),
    changeCase = require('change-case'),
    request = rootRequire('app/helpers/request'),
    log = require('../../../../../config/log');

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

async function expand(responseBody, __, includeFullObject, prune) {
    __ = __ || i18n.__;
    let fieldConstantCase = changeCase.constantCase(responseBody.field);
    // if enum then look up value
    // else get item from API
    if (!_.has(config.fields[fieldConstantCase], 'type')) {
        // throw 'No such facet type configured';
        // default to raw
        config.fields[fieldConstantCase] = {type: config.type.RAW};
    }

    // Preprocess
    // Notice that sorting makes little sense if the list isn't exhaustive
    if (config.fields[fieldConstantCase].ordering === 'NUMERIC') {
        responseBody.results = _.sortBy(responseBody.results, function(e) {
            return _.toSafeInteger(e.name);
        });
    }
    if (prune && config.fields[fieldConstantCase].prune) {
        _.remove(responseBody.results, config.fields[fieldConstantCase].prune);
    }

    // resolve names
    if (config.fields[fieldConstantCase].type == config.type.RAW) {
        responseBody.results.forEach(function(f) {
            f.displayName = f.name.replace(',', ' - ');
        });
        return responseBody;
    } else if (config.fields[fieldConstantCase].type == config.type.ENUM && !config.fields[fieldConstantCase].url) {
        responseBody.results.forEach(function(f) {
            let translationPath = config.fields[fieldConstantCase].translationPath.replace('{VALUE}', f.name);
            f.displayName = __(translationPath);
        });
        return responseBody;
    } else if (config.fields[fieldConstantCase].url) {
        let facetPromises = responseBody.results.map(function(item) {
            return addResolveUrl(item, config.fields[fieldConstantCase], includeFullObject);
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
        log.error({statusCode: response.statusCode, module: 'Dataset', url: options.url}, response.body);
        throw 'failed to get key from url: ' + url;
    }
    item.displayName = _.get(response, 'body.' + conf.field, 'Unknown');
    if (includeFullObject) {
        item._resolved = response.body;
    }
    return item;
}
