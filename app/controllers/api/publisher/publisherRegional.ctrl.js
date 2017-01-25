'use strict';

/**
 * @fileoverview Proxy endpoint to return publisher count for a given region.
 */

const express = require('express'),
      router = express.Router(),
      //apicache = require('apicache'),
      PublisherRegional = require('../../../models/gbifdata/publisher/publisherRegional'),
      log = require('../../../../config/log');

//let cache = apicache.middleware;

module.exports = app => {
    app.use('/api', router);
};

router.get('/publisher/count', (req, res, next) => {
    PublisherRegional.groupBy(req.query)
        .then(results => {
            let count = {};
            count.region = req.query.gbifRegion;
            count.publisher = results.length;
            res.json(count);
        })
        .catch(err => {
            log.error('Error in /api/publisher/count controller: ' + err.message);
            next(err)
        });
});

router.get('/publisher/endorsed-by/:iso2?', (req, res, next) => {
    PublisherRegional.numberEndorsedBy(req.params.iso2)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            log.error('Error in /api/publisher/endorsed-by/:iso2 controller: ' + err.message);
            next(err)
        });
});
