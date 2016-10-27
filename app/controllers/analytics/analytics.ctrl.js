var express = require('express'),
    cfg = require('../../../config/config'),
    apiCfg = require('../../models/gbifdata/apiConfig'),
    Country = require('../../models/gbifdata/gbifdata').Country,
    router = express.Router();

module.exports = function (app) {
    app.use('/analytics', router);
};

router.get('/global', function (req, res, next) {
    renderPage(req, res, next, 'global');
});

router.get('/country/:country/about', function (req, res, next) {
    //TODO: make sure iso country exists
    renderPage(req, res, next, 'country/' + req.params.country + '/about', req.params.country, true);
});

router.get('/country/:country/published', function (req, res, next) {
    //TODO: make sure publishing country exists in GBIF
    renderPage(req, res, next, 'country/' + req.params.country + '/publishedBy', req.params.country, false);
});


function renderPage(req, res, next, path, country, about) {
    try {
        res.render('pages/analytics/analytics', {
            country: country,
            about: about,
            thumbBase: apiCfg.image.url + "fit-in/300x250/http://" + cfg.analyticsImg + path + "/figure/",
            imgBase: apiCfg.image.url + "http://" + cfg.analyticsImg + path + "/figure/",
            _meta: {
                title: 'Data Trends'
            }
        });
    } catch (e) {
        next(e);
    }
}
