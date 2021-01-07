'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    gbifData = require('../../../../models/gbifdata/gbifdata');

const querystring = require('querystring');

module.exports = function(app) {
    app.use('/api', router);
};

let requestCounter = 0;
let requestCancellationCounter = 0;
router.get('/occurrence/search/cancellation', function(req, res) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  res.json({requests: requestCounter, cancellations: requestCancellationCounter, frequency: requestCancellationCounter / requestCounter});
});

router.get('/occurrence/search', function(req, res) {
    // START: track request cancellation frequency
    requestCounter++;
    let cancelRequest = false;
    req.on('aborted', function (err) {
      cancelRequest = true;
    });

    req.on('close', function (err) {
      cancelRequest = true;
    });
    // END: tracking cancellation

    delete req.query.locale;
    delete req.query.advanced;
    occurrenceSearch(req.query).then(function(data) {
        let settings = {
            facets: true,
            query: req.query,
            expandList: [
                {
                    fromKey: 'datasetKey',
                    type: expandConfig.DATASET_KEY
                },
                {
                    fromKey: 'publishingOrgKey',
                    type: expandConfig.PUBLISHING_ORG
                },
                {
                    fromKey: 'speciesKey',
                    type: expandConfig.SPECIES_KEY
                },
                {
                    fromKey: 'key',
                    toKey: 'verbatimRecord',
                    fields: ['http://rs.tdwg.org/dwc/terms/scientificName'],
                    type: expandConfig.VERBATIM_RECORD
                }
            ],
            expandConfig: expandConfig,
            currentLocale: res.locals.gb.locales.current,
            vocabularyMapping: res.locals.gb.locales.vocabularyMapping
        };
        gbifData.expand.expand(data, settings, res.__, function(err) {
            // START: track request cancellation frequency
            if (cancelRequest) {
              requestCancellationCounter++;
            }
            // END: tracking cancellation

            if (err) {
                // TODO handle expansion errors
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

function occurrenceSearch(query) {
    'use strict';
    let deferred = Q.defer();
    helper.getApiData(apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query), function(err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else if (data) {
            deferred.resolve(data);
        } else {
            deferred.reject(err);
        }
    }, {retries: 1, timeoutMilliSeconds: 50000});
    return deferred.promise;
}

const expandConfig = {
    PUBLISHING_ORG: {
        type: 'KEY',
        endpoint: apiConfig.publisher.url,
        fromKey: 'title'
    },
    DATASET_KEY: {
        type: 'KEY',
        endpoint: apiConfig.dataset.url,
        fromKey: 'title'
    },
    BASIS_OF_RECORD: {
        type: 'ENUM',
        translationPath: 'basisOfRecord.'
    },
    KINGDOM_KEY: {
        type: 'KEY',
        endpoint: apiConfig.taxon.url,
        fromKey: 'scientificName'
    },
    VERBATIM_RECORD: {
    type: 'TEMPLATE',
    templatedEndpoint: apiConfig.occurrence.url + '{{key}}/verbatim',
    fromKey: 'key'
    }
};
