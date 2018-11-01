'use strict';

let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    _ = require('lodash'),
    querystring = require('querystring'),
    Species = require('./species'),
    request = rootRequire('app/helpers/request');

async function query(query, options) {
    options = options || {};
    let threshold = options.threshold || 80;
    query = query || {};

    let baseRequest = {
        url: apiConfig.taxonMatch.url + '?' + querystring.stringify(query),
        timeout: options.timeout || 30000,
        method: 'GET',
        json: true
    };

    let items = await request(baseRequest);
    if (items.statusCode > 299) {
        throw items;
    }
    Species.extractHighlights(items);
    return getSuggestions(items.body, threshold);
}

function getSuggestions(body, threshold) {
    let results = [],
    alternatives = body.alternatives,
    firstResult = body;
    delete firstResult.alternatives;
    if (!_.isUndefined(firstResult.usageKey)) {
        results.push(firstResult);
    }
    if (_.isArray(alternatives)) {
        results = _.concat(results, alternatives);
    }
    results = _.filter(results, function(e) {
return e.confidence > threshold;
});
    results = _.orderBy(results, ['confidence'], ['desc']);
    return results;
}


module.exports = {
    query: query
};
