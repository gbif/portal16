'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    DataSetOmniSearch = require('../../search/dataset'),
    gbifData = require('../../../../models/gbifdata/gbifdata');

const querystring = require('querystring');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/dataset/search', function(req, res) {
    req.query.hl = true;
    datasetSearch(req.query).then(function(data) {
        DataSetOmniSearch.extractHighlights(data, req.query);
        let settings = {
            facets: true,
            query: req.query,
            expandList: [
                {
                    fromKey: 'key',
                    type: {
                        type: 'KEY',
                        endpoint: apiConfig.dataset.url
                    },
                    fields: ['title', 'pubDate', 'modified', 'created']
                },
                {
                    fromKey: 'publishingOrganizationKey',
                    type: expandConfig.PUBLISHING_ORG
                },
                {
                    fromKey: 'hostingOrganizationKey',
                    type: expandConfig.HOSTING_ORG
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


function datasetSearch(query) {
    'use strict';
    let deferred = Q.defer();
    helper.getApiData(apiConfig.datasetSearch.url + '?' + querystring.stringify(query), function(err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else if (data) {
            deferred.resolve(data);
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
}


const expandConfig = {
    TYPE: {
        type: 'ENUM',
        translationPath: 'datasetType.'
    },
    PUBLISHING_COUNTRY: {
        type: 'ENUM',
        translationPath: 'country.'
    },
    PUBLISHING_ORG: {
        type: 'KEY',
        endpoint: apiConfig.publisher.url,
        fromKey: 'title'
    },
    HOSTING_ORG: {
        type: 'KEY',
        endpoint: apiConfig.publisher.url,
        fromKey: 'title'
    }
};
