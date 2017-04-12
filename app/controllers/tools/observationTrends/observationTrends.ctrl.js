"use strict";

var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/tools/observation-trends', function (req, res, next) {
    try {
        res.render('pages/tools/observationTrends/observationTrends', {
            _meta: {
                title: 'Observation Trends',
                hideFooter: true
            },
            aboutUrl: 'tools/observation-trends/about'
        });
    } catch (err) {
        next(err);
    }
});

router.get('/embed/observation-trends', function (req, res, next) {
    try {
        res.render('pages/tools/observationTrends/observationTrendsEmbed', {
            _meta: {
                title: 'Observation Trends',
                hideFooter: true,
                removeMenu: true,
                useEmbeddedStyleSheet: true
            },
            aboutUrl: 'tools/observation-trends/about'
        });
    } catch (err) {
        next(err);
    }
});