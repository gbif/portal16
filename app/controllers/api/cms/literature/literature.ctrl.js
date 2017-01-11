'use strict';

/**
 * @fileoverview Proxy endpoint to return literature count for a given region.
 */

let express = require('express'),
    router = express.Router(),
    Literature = require('../../../../models/cmsData/literature/literature'),
    log = require('../../../../../config/log');

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