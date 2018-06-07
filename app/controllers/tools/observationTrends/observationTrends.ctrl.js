'use strict';

let express = require('express'),
    helper = rootRequire('app/models/util/util'),
    resource = require('../../resource/key/resourceKey'),
    router = express.Router();

module.exports = function(app) {
    app.use('/', router);
};

router.get('/tools/observation-trends', function(req, res, next) {
    try {
        res.render('pages/tools/observationTrends/observationTrends', {
            _meta: {
                title: req.__('observationTrends.drawerTitle'),
                description: req.__('observationTrends.intro')
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
                title: req.__('observationTrends.drawerTitle'),
                description: req.__('observationTrends.intro'),
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

router.get('/tools/observation-trends/about', function(req, res, next) {
    let query = {
        'content_type': 'Tool',
        'fields.keywords': 'observationtrends'
    };
    resource.getFirst(query, 2, false, res.locals.gb.locales.current)
        .then((contentItem) => {
            helper.renderPage(req, res, next, contentItem, 'pages/resource/key/tool/tool.nunjucks');
        })
        .catch(function(err) {
            if (err.statusCode == 404) {
                next();
            } else {
                next(err);
            }
        });
});
