let express = require('express'),
    baseConfig = require('../../../config/config'),
    router = express.Router();

module.exports = function(app) {
    app.use('/', router);
};

router.get('/search', function(req, res, next) {
    try {
        let searchTerm = req.query.q,
        description = req.__('search.searchDescription');

        if (searchTerm) {
        description += ' ' + req.__('search.searchDescriptionDetail', {searchTerm: searchTerm});
        }
          let context = {
                query: searchTerm,
                _meta: {
                    bodyClass: 'omnisearch',
                    tileApi: baseConfig.tileApi,
                    title: req.__('search.search'),
                    description: description
                }
            };

        res.render('pages/search/search', context);
    } catch (err) {
        next(err);
    }
});
