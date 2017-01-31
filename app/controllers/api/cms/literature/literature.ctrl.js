'use strict';

/**
 * @fileOverview Proxy endpoint to return literature count for a given region.
 */

const express = require('express'),
      router = express.Router(),
      log = require('../../../../../config/log'),
      Literature = require('../../../../models/cmsData/literature/literature');

module.exports = app => {
    app.use('/api', router);
};

router.get('/literature/count', (req, res, next) => {
    Literature.countBy(req.query)
        .then(literatureRegional => {
            let count = {};
            count['region'] = literatureRegional.region;
            count['literature'] = literatureRegional.literature;
            count['countriesLiteratureAuthorsFrom'] = literatureRegional.countriesLiteratureAuthorsFrom;
            count['literatureAuthors'] = literatureRegional.literatureAuthors;
            res.json(count);
        })
        .catch(err => {
            log.error('Error in /api/literature/count controller: ' + err.message);
            next(err)
        });
      });

router.get('/literature-yearly/count', (req, res, next) => {
    Literature.yearly(req.query)
        .then(literatureByYear => {
            if (Array.isArray(literatureByYear)) {
                // strip out the results prior to 2008
                let literatureByYearFrom2008 = [];
                literatureByYear.forEach(y => {
                    if (y.year >= 2008) {
                        literatureByYearFrom2008.push(y);
                    }
                });

                res.json(literatureByYearFrom2008);
            }
            else {
                let reason = 'Data format issue: not expected array';
                throw new Error(reason);
            }
        })
        .catch(err => {
            log.error('Error in /api/literature/count controller: ' + err.message);
            next(err)
        });
});
