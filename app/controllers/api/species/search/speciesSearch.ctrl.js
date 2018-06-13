'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    SpeciesOmniSearch = require('../../search/species'),
    gbifData = require('../../../../models/gbifdata/gbifdata');

const querystring = require('querystring');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/species/search', function(req, res) {
    speciesSearch(req.query).then(function(data) {
        SpeciesOmniSearch.extractHighlights(data);
        data = prune(data, ['descriptions']);
        let settings = {
            facets: true,
            query: req.query,
            expandList: [
                {
                    fromKey: 'datasetKey',
                    type: expandConfig.DATASET_KEY
                },
                {
                    fromKey: 'key',
                    toKey: 'media',
                    type: expandConfig.MEDIA,
                    fields: ['results']
                }
            ],
            expandConfig: expandConfig
        };
        gbifData.expand.expand(data, settings, res.__, function(err) {
            if (err) {
                // TODO handle expansion errors
                res.status(500);
                res.json(data);
            } else {
                res.json(data);
            }
        });
    }, function(err) {
        res.status(_.get(err, 'errorResponse.statusCode', 500));
        res.json({
            body: _.get(err, 'errorResponse.body', err)
        });
    });
});


function prune(data, keys) {
    'use strict';
    data.results.forEach(function(item) {
        keys.forEach(function(key) {
            delete item[key];
        });
    });
    return data;
}

function speciesSearch(query) {
    'use strict';
    query.hl = true;
    let deferred = Q.defer();
    helper.getApiData(apiConfig.taxonSearch.url + '?' + querystring.stringify(query), function(err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else if (data) {
            deferred.resolve(data);
        } else {
            deferred.reject(err);
        }
    }, {retries: 3, timeoutMilliSeconds: 10000});
    return deferred.promise;
}

const expandConfig = {
    RANK: {
        type: 'ENUM',
        translationPath: 'taxonRank.'
    },
    DATASET_KEY: {
        type: 'KEY',
        endpoint: apiConfig.dataset.url,
        fromKey: 'title'
    },
    CONSTITUENT_KEY: {
        type: 'KEY',
        endpoint: apiConfig.dataset.url,
        fromKey: 'title'
    },
    HIGHERTAXON_KEY: {
        type: 'KEY',
        endpoint: apiConfig.taxon.url,
        fromKey: 'canonicalName'
    },
    ISSUE: {
        type: 'ENUM',
        translationPath: 'issueEnum.'
    },
    NAME_TYPE: {
        type: 'ENUM',
        translationPath: 'nameTypeEnum.'
    },
    ORIGIN: {
        type: 'ENUM',
        translationPath: 'originEnum.'
    },
    STATUS: {
        type: 'ENUM',
        translationPath: 'TaxonomicStatus.'
    },
    MEDIA: {
        type: 'TEMPLATE',
        templatedEndpoint: apiConfig.taxon.url + '{{key}}/media',
        fromKey: 'key'
    }
};
