"use strict";
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    http = require('http'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/newsroom/events/:key\.:ext?', function (req, res, next) {

let url = apiConfig.newsroom.url+'events/'+req.params.key;


    let newReq = http.request(url, function(newRes) {
        let headers = newRes.headers;

        headers['content-type'] = 'text/Calendar';
        res.writeHead(newRes.statusCode, headers);
        newRes.pipe(res);
    }).on('error', function(err) {
        next(err)
    });

    req.pipe(newReq);

});

