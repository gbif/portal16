"use strict";
var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/js/base/shared/signpost.js', function (req, res) {
    res.set('Content-Type', 'application/javascript');
    res.render('shared/signpost', {});
});

