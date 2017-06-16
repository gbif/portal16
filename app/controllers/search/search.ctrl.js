var express = require('express'),
    baseConfig = require('../../../config/config'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/search', function (req, res, next) {
    var referer = req.header('Referer');
    if (referer && referer.indexOf('www.gbif.org') !== -1) {
        res.cookie('isRedirectedFromProd', 'true',
            {
                maxAge: 5000,
                secure: true,
                httpOnly: false
            }
        );
    }
    try {
        var searchString = req.query.q,
            context = {
                query: searchString,
                _meta: {
                    bodyClass: 'omnisearch',
                    tileApi: baseConfig.tileApi,
                    hideFooter: true,
                    title: res.__('stdTerms.search')
                }
            };

        res.render('pages/search/search', context);
    } catch (err) {
        next(err);
    }
});