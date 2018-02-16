'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    async = require('async'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    clientCancelledRequest = 'clientCancelledRequest';

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/occurrence/taxon', function(req, res) {
    let cancelRequest = false;
    req.on('close', function() {
        cancelRequest = true;
    });

    // clear all facets and ask for speciesKey facet only
    let type = req.query.type || 'species';
    if (['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species', 'taxon'].indexOf(type) < 0) {
        res.status(500);
        res.send('Invalid type.');
    }
    req.query.facet = type + 'Key';

    // get one more facet than asked for and use that to test for last
    let facetLimit = parseInt(req.query.limit) || 20;
    let offset = parseInt(req.query.offset) || 0;
    req.query[type + 'Key.facetOffset'] = offset;
    req.query[type + 'Key.facetLimit'] = facetLimit + 1;

    // We do not care about the result count
    req.query.limit = 0;
    req.query.offset = undefined;

    let endOfRecords = false;
    occurrenceSearch(req.query).then(function(species) {
        if (cancelRequest) {
            throw {type: clientCancelledRequest};
        }
        let speciesKeys = _.get(species, 'facets[0].counts', []);

        // only return the amount asked for, and since we added one to test for last, then remove last
        if (speciesKeys.length <= facetLimit) {
            endOfRecords = true;
        } else {
            speciesKeys.pop();
        }

        async.map(speciesKeys, function(item, cb) {
            helper.getApiData(apiConfig.taxon.url + item.name, function(err, taxon) {
                if (err) {
                    cb(err);
                } else if (typeof taxon.errorType !== 'undefined') {
                    cb(taxon.errorType);
                } else {
                    taxon._count = item.count;
                    cb(null, taxon);
                }
            });
        }, function(err, results) {
            if (err) {
                res.json({err: 'failed to look up all keys'});
            } else {
                let response = {
                    offset: offset,
                    limit: facetLimit,
                    endOfRecords: endOfRecords,
                    results: results
                };
                res.json(response);
            }
        });
    }, function(err) {
        res.status(_.get(err, 'errorResponse.statusCode', 500));
        res.json({
            body: _.get(err, 'errorResponse.body', err)
        });
    }).catch(function(err) {
        res.status(500);
        res.send();
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
    }, {retries: 2, timeoutMilliSeconds: 30000});
    return deferred.promise;
}
