'use strict';

/**
 * @fileOverview Proxy endpoint to return literature count for a given region.
 */

const express = require('express'),
      router = express.Router(),
      //apicache = require('apicache'),
      log = require('../../../../../config/log'),
      Literature = require('../../../../models/cmsData/literature/literature');

//let cache = apicache.middleware;

module.exports = app => {
    app.use('/api', router);
};

router.get('/literature/count', (req, res, next) => {
    Literature.groupBy(req.query)
        .then(literatureRegional => {
            let count = {};
            count['region'] = literatureRegional.region;
            count['literature'] = literatureRegional.literature.length;
            count['literatureAuthorCountries'] = literatureRegional.countries.length;
            count['literatureAuthors'] = literatureRegional.authorsCount;
            res.json(count);
        })
        .catch(err => {
            log.error('Error in /api/literature/count controller: ' + err.message);
            next(err)
        });
});