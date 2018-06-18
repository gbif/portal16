let express = require('express'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router();

module.exports = function(app) {
    app.use('/', router);
};

router.get('/health', function(req, res, next) {
    helper.renderPage(req, res, next, {
        _meta: {
            title: res.__('health.systemHealth'),
            description: res.__('health.description')
        }
    }, 'pages/health/health');
});
