'use strict';

const express = require('express'),
      router = express.Router(),
      apicache = require('apicache'),
      Directory = require('../../../models/gbifdata/directory/directory'),
      log = require('../../../../config/log');

let cache = apicache.middleware;

module.exports = app => {
    app.use('/api', router);
};

router.get('/directory/contacts', cache('10 minutes'), (req, res, next) => {
    Directory.getContacts(res)
        .then(data => {
            Directory.postProcessContacts(data, res.__);
            res.json(data);
        })
        .catch(err => {
            log.error('Error in /api/directory/contacts controller: ' + err.message);
            next(err)
        });
});