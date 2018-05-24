'use strict';

/**
 * @fileOverview Route to the GBIF Network page, an index to all participants.
 */

const express = require('express'),
    router = express.Router(),
    Q = require('q'),
    helper = rootRequire('app/models/util/util'),
    resource = require('../resource/key/resourceKey');


module.exports = function(app) {
    app.use('/', router);
};

router.get('/the-gbif-network/:region?', (req, res, next) => {
    let query = {},
        validRegions = ['GLOBAL', 'AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA', 'PARTICIPANT_ORGANISATIONS', 'GBIF_AFFILIATES'],

        region;

    if (typeof req.params.region !== 'undefined') {
        region = req.params.region.toUpperCase().replace('-', '_');
    } else {
        region = 'GLOBAL';
    }

    if (validRegions.indexOf(region) !== -1) {
        query.gbifRegion = region;
    } else {
        next();
        return;
    }


    let contentPromise = ( region !== 'GLOBAL') ? resource.getByAlias(req.path, 2, false, res.locals.gb.locales.current) : Q.resolve(false);

    contentPromise.then((result) => {
            let opts = {};
            if (result !== false && result.main) {
                opts.main = result.main;
            }
            res.render('pages/theGbifNetwork/theGbifNetwork.nunjucks', opts);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/templates/the-gbif-network/:region/regionArticle.html', function(req, res, next) {
    let urlAlias = '/the-gbif-network/' + req.params.region;

    resource.getByAlias(urlAlias, 2, false, res.locals.gb.locales.current)
        .then((contentItem) => {
            helper.renderPage(req, res, next, contentItem, 'pages/theGbifNetwork/regionArticle.nunjucks');
            //  res.json(result);
        })
        .catch(function(err) {
            if (err.statusCode == 404) {
                next();
            } else {
                next(err);
            }
        });
});

