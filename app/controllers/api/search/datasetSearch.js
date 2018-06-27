'use strict';

let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    _ = require('lodash'),
    request = require('requestretry');

async function query(query, options) {
    options = options || {};
    query = query || {};

    let baseRequest = {
        url: apiConfig.datasetSearch.url + '?' + querystring.stringify(query),
        timeout: options.timeout || 30000,
        method: 'GET',
        json: true
    };

    let datasets = await request(baseRequest);
    if (datasets.statusCode > 299) {
        throw datasets;
    }
    extractHighlights(datasets.body, query);
    return datasets.body;
}

function extractHighlights(data, query) {
    'use strict';
    let re = /(([^\s>]+)\s){0,3}(\s*<em class="gbifHl">[^<]*<\/em>\s*)+([^\s<]+\s){0,2}([^\s<]*)/;

    _.each(data.results, function(item) {
        let highlights = {};
        if (item.description) {
                let match = re.exec(item.description);
                if (match) {
                    highlights.description = (match[0]);
                }
        }

        if (item.keywords && query.q) {
            let kwMatch = _.find(item.keywords, function(k) {
                return k.toLowerCase() === query.q.toLowerCase();
            });
            if (kwMatch) {
                let remainders = _.filter(item.keywords, function(k) {
                    return k !== kwMatch;
                });

                highlights.keywords = '<em class="gbifHl">' + kwMatch + '</em>, ' + remainders.slice(0, 2).join(', ');
                if (remainders.length > 2) {
                    highlights.keywords += '.....';
                }
            }
        }


        item.highlights = highlights;
    });
    return data;
}

module.exports = {
    query: query,
    extractHighlights: extractHighlights
};
