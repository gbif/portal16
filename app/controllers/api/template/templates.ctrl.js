var express = require('express'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router();

module.exports = function (app) {
    app.use('/api/template', router);
};

router.get('/footer.html', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'shared/layout/partials/footer/footer');
});

router.get('/search.html', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'shared/layout/partials/navigation/search/search');
});