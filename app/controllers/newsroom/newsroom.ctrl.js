"use strict";
var express = require('express'),
    request = require('request'),
    log = rootRequire('config/log'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/newsroom/news/rss', function (req, res) {

    request
        .get(apiConfig.newsroom.url + 'news/rss')
        .on('error', function(err) {
            log.error(err)
        })
        .pipe(res);
});