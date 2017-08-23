"use strict";
var express = require('express'),
    router = express.Router(),
    resource = rootRequire('app/controllers/api/resource/search/resourceSearch'),
    helper = rootRequire('app/models/util/util');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/faq2', function (req, res, next) {
    helper.renderPage(req, res, next, {
        _meta: {
            title: 'FAQ'
        }
    }, 'pages/custom/faq/seo');
});