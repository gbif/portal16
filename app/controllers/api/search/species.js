'use strict';

let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    _ = require('lodash'),
    request = rootRequire('app/helpers/request');

async function get(key, depth) {
    depth = depth || 0;
    let baseRequest = {
        url: apiConfig.taxon.url + key,
        timeout: 30000,
        method: 'GET',
        json: true
    };
    let item = await request(baseRequest);
    if (item.statusCode > 299) {
        throw item;
    }
    if (depth > 0) {
        depth--;
        return expand(item.body, depth);
    } else {
        return item.body;
    }
}

async function expand(items) {
    // TODO stub. inteded to expand foreign keys, related etc. datasetKey, constituentDatasetKey, name, references etc
    return items;
}

async function query(query, options) {
    options = options || {};
    query = query || {};

    let baseRequest = {
        url: apiConfig.taxonSearch.url + '?' + querystring.stringify(query),
        timeout: options.timeout || 30000,
        method: 'GET',
        json: true
    };

    let items = await request(baseRequest);
    if (items.statusCode > 299) {
        throw items;
    }
    extractHighlights(items.body);

    return items.body;
}

function extractHighlights(data) {
    'use strict';
    let re = /(([^\s>]+)\s){0,3}(\s*<em class="gbifHl">[^<]*<\/em>\s*)+([^\s<]+\s){0,2}([^\s<]*)/;

    _.each(data.results, function(item) {
        let highlights = {descriptions: [], vernacularNames: []};
        if (item.descriptions) {
            for (let i = 0; i < item.descriptions.length; i++) {
                let match = re.exec(item.descriptions[i].description);
                if (match) {
                    highlights.descriptions.push(match[0]);
                }
            }
        }

        if (item.vernacularNames) {
            for (let i = 0; i < item.vernacularNames.length; i++) {
                if (item.vernacularNames[i].vernacularName.indexOf('<em class="gbifHl">') > -1) {
                    highlights.vernacularNames.push(item.vernacularNames[i]);
                }
            }
        }

        item.highlights = highlights;
    });
    return data;
}

module.exports = {
    extractHighlights: extractHighlights,
    get: get,
    query: query
};
