'use strict';
let express = require('express');
let config = rootRequire('config/config');
let router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

router.get('/robots.txt', function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    res.set('Content-Type', 'text/plain');
    res.render('pages/robots', {DOMAIN: config.domain});
});

