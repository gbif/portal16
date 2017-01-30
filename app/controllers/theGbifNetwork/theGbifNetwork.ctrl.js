'use strict';

/**
 * @fileOverview Route to the GBIF Network page, an index to all participants.
 */

const express = require('express'),
      router = express.Router(),
      //apicache = require('apicache'),
      helper = require('../../models/util/util'),
      TheGbifNetwork = rootRequire('app/models/gbifdata/theGbifNetwork/theGbifNetwork');

//let cache = apicache.middleware;

module.exports = function (app) {
    app.use('/', router);
};

router.get('/the-gbif-network/:region?', (req, res, next) => {

    let context = {},
        query = {},
        validRegions = ['GLOBAL', 'AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA'],
        participantTypes = ['voting_participant', 'associate_country_participant', 'other_associate_participant'],
        region;

    if (typeof req.params.region !== 'undefined') region = req.params.region.toUpperCase().replace('-', '_');

    if (typeof req.params.region !== 'undefined' && validRegions.indexOf(region) !== -1) {
        query.gbifRegion = region;
    }
    else {
        query.gbifRegion = 'GLOBAL';
    }

    context.validRegions = validRegions;
    context.participantTypes = participantTypes;
    context.locale = req.locale;

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
