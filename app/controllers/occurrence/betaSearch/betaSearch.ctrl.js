let express = require('express'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

router.get('/occurrence-search/beta', function(req, res, next) {
  helper.renderPage(req, res, next, {_meta: {hideFooter: true}}, 'pages/occurrence/beta/betaSearch.nunjucks');
});

