const _ = require('lodash'),
    changeCase = require('change-case');

module.exports = {
    normalize: normalize
};

function normalize(result, offset, limit) {
    try {
        res = {
            offset: offset || 0,
            limit: limit || 20,
            endOfRecords: false,
            count: _.get(result, 'hits.total', 0),
            results: _.get(result, 'hits.hits', []),
            facets: []
        };

        res.results = _.map(res.results, '_source');

        res.endOfRecords = res.offset + res.limit >= res.count;

        //add facets
        if (_.isObject(result.aggregations)) {
            Object.keys(result.aggregations).forEach(function (key) {
                let counts = _.get(result.aggregations[key], 'counts.buckets') || _.get(result.aggregations[key], 'buckets'),
                facet = {
                    field: changeCase.constantCase(key),
                    counts: counts.map(function(e){
                        return {
                            name: e.key,
                            count: e.doc_count
                        };
                    })
                };
                res.facets.push(facet);
            });
        }
        return res;
    } catch (e) {
        throw e;
    }
}