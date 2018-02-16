'use strict';
let express = require('express'),
    router = express.Router(),
    helper = rootRequire('app/models/util/util');

module.exports = function(app) {
    app.use('/', router);
};

router.get('/faq', function(req, res, next) {
    helper.renderPage(req, res, next, {
        _meta: {
            title: 'FAQ'
        }
    }, 'pages/custom/faq/seo');
});
