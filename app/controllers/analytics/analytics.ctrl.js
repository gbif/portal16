let express = require('express'),
    cfg = require('../../../config/config'),
    apiCfg = require('../../models/gbifdata/apiConfig'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/analytics', router);
};

router.get('/global', function(req, res, next) {
    renderPage(req, res, next, 'global');
});

router.get('/country/:country/about', function(req, res, next) {
    // TODO: make sure iso country exists
    renderPage(req, res, next, 'country/' + req.params.country + '/about', req.params.country, true);
});

router.get('/country/:country/published', function(req, res, next) {
    // TODO: make sure publishing country exists in GBIF
    renderPage(req, res, next, 'country/' + req.params.country + '/publishedBy', req.params.country, false);
});


function renderPage(req, res, next, path, country, about) {
    let description;

    if (about && country) {
        description = req.__('trends.analyticsCountry.fromDescription', {country: req.__('country.' + country)});
    } else if (country) {
        description = req.__('trends.analyticsCountry.publishedByDescription', {country: req.__('country.' + country)});
    } else {
        description = req.__('trends.analyticsGlobalDescription');
    }


    try {
        res.render('pages/analytics/analytics', {
            country: country,
            about: about,
            year: new Date().getFullYear(),
            thumbBase: apiCfg.image.url + 'fit-in/300x250/https://' + cfg.analyticsImg + path + '/figure/',
            imgBase: apiCfg.image.url + 'https://' + cfg.analyticsImg + path + '/figure/',
            _meta: {
                title: req.__('trends.analyticsTitle'),
                description: description,
                imageCache: apiCfg.image.url,
                image: 'https://' + cfg.analyticsImg + path + '/figure/occ_repatriation.png'
            }
        });
    } catch (e) {
        next(e);
    }
}
