"use strict";
let express = require('express'),
    router = express.Router(),
    helper = rootRequire('app/models/util/util');


module.exports = function (app) {
    app.use('/', router);
};

router.get('/maptest', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'components/map/mapWidget/mapTest.nunjucks');
});

