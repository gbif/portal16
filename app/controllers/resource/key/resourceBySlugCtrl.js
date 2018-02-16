let express = require('express'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router(),
    resource = require('./resourceKey');

module.exports = function(app) {
    app.use('/', router);
};

router.get('/*.:ext?', function(req, res, next) {
    let urlAlias = req.path;

    resource.getByAlias(urlAlias, 2, false, res.locals.gb.locales.current)
        .then(function(contentItem) {
            helper.renderPage(req, res, next, contentItem, 'pages/resource/key/article/article');
        })
        .catch(function(err) {
            if (err.statusCode == 404) {
                next();
            } else {
                next(err);
            }
        });
});
