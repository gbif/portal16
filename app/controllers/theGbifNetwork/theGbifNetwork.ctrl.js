'use strict';

/**
 * @fileOverview Route to the GBIF Network page, an index to all participants.
 */

const express = require('express'),
      router = express.Router(),
      request = require('request'),
      //apicache = require('apicache'),
      helper = require('../../models/util/util'),
      TheGbifNetwork = rootRequire('app/models/gbifdata/theGbifNetwork/theGbifNetwork');

//let cache = apicache.middleware;

module.exports = function (app) {
    app.use('/', router);
};

router.get('/the-gbif-network', (req, res, next) => {

    let context = {},
        query = {},
        gbifRegion = 'GLOBAL',
        validRegions = ['AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA'];

    if (req.query.hasOwnProperty('gbifRegion') && req.query.gbifRegion !== 'undefined' && validRegions.indexOf(req.query.gbifRegion) !== -1) {
        query.gbifRegion = req.query.gbifRegion;
    }

    TheGbifNetwork.get(res)
        .then(data => {
            context.intro = data[0];
            let url = 'http://' + req.get('host') + '/api/directory/participants/count';
            return helper.getApiDataPromise(url, {'qs': query});
        })
        .then(count => {
            context.count = count;
            let url = 'http://' + req.get('host') + '/api/publisher/count';
            return helper.getApiDataPromise(url, {'qs': query});
        })
        .then(count => {
            context.count = Object.assign(context.count, count);
            let url = 'http://' + req.get('host') + '/api/literature/count';
            return helper.getApiDataPromise(url, {'qs': query});
        })
        .then(count => {
            context.count = Object.assign(context.count, count);
            res.render('pages/theGbifNetwork/theGbifNetwork.nunjucks', {
                data: context,
                hasTitle: true
            });
        })
        .catch(err => {
            next(err + 'at theGbifNetwork.ctrl line 22.')
        });
});