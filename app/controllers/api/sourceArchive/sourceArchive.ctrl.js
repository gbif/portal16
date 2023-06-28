'use strict';
let express = require('express'),
    router = express.Router(),
    https = require('https'),
    cors = require('cors'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/source-archive/:datasetKey/:fileName', cors(), function(req, res, next) {
let url = apiConfig.sourceArchive.url + req.params.datasetKey + '/' + req.params.fileName;


    let newReq = https.request(url, function(newRes) {
        newRes.pipe(res);
    }).on('error', function(err) {
        next(err);
    });

    req.pipe(newReq);
});