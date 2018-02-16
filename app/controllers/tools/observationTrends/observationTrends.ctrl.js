'use strict';

let express = require('express'),
    router = express.Router();

module.exports = function(app) {
    app.use('/', router);
};

router.get('/tools/observation-trends', function(req, res, next) {
    try {
        res.render('pages/tools/observationTrends/observationTrends', {
            _meta: {
                title: req.__('meta.observationTrendsTitle'),
                description: req.__('meta.observationTrendsDescription')
            },
            aboutUrl: 'tools/observation-trends/about'
        });
    } catch (err) {
        next(err);
    }
});

router.get('/embed/observation-trends', function(req, res, next) {
    try {
        res.render('pages/tools/observationTrends/observationTrendsEmbed', {
            _meta: {
                title: req.__('meta.observationTrendsTitle'),
                description: req.__('meta.observationTrendsDescription'),
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
