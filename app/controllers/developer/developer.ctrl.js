let express = require('express'),
    _ = require('lodash'),
    cfg = require('../../../config/config'),
    apiCfg = require('../../models/gbifdata/apiConfig'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/developer', router);
};

router.get('/', function(req, res) {
    res.redirect(302, '/developer/summary');
});

router.get('/summary', function(req, res, next) {
    renderPage(req, res, next, 'summary');
});

router.get('/registry', function(req, res, next) {
    renderPage(req, res, next, 'registry');
});

router.get('/species', function(req, res, next) {
    renderPage(req, res, next, 'species');
});

router.get('/occurrence', function(req, res, next) {
    renderPage(req, res, next, 'occurrence');
});

router.get('/maps', function(req, res, next) {
    renderPage(req, res, next, 'maps');
});

router.get('/news', function(req, res, next) {
    renderPage(req, res, next, 'news');
});

function renderPage(req, res, next, page) {
    let title = (page === 'summary') ? 'GBIF REST API' : 'GBIF ' + _.camelCase(page) + ' API';
    try {
        res.render('pages/developer/' + page, {
            page: page,
            apiBase: 'https:' + cfg.dataApi,
            apidocs: cfg.apidocs,
            _meta: {
                title: title
            }
        });
    } catch (e) {
        next(e);
    }
}
