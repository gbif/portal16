let express = require('express'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

router.get('/system-health', function(req, res, next) {
    helper.renderPage(req, res, next, {
        _meta: {
            title: res.__('healthSummary.systemHealth'),
            description: res.__('healthSummary.description')
        }
    }, 'pages/health/health');
});
