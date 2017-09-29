"use strict";
var express = require('express'),
    router = express.Router(),
    utils = rootRequire('app/helpers/utils'),
    processModel = require('./datasetProcess.model');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/dataset/:key/processSummary', function (req, res, next) {
    var datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        next();
        return;
    }
    processModel.getProcessSummary(datasetKey)
        .then(function(processSummary){
            res.json(processSummary);
        })
        .catch(function(err){
            res.status(err.statusCode || 500);
            res.send();
        });
});

router.get('/dataset/:key/crawling', function (req, res, next) {
    var datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        next();
        return;
    }
    processModel.isDatasetBeingCrawled(datasetKey)
        .then(function(currentCrawl){
            if (currentCrawl) {
                res.json(currentCrawl);
            }
             else {
                res.status(204);
                res.send();
            }
        })
        .catch(function(err){
            res.status(err.statusCode || 500);
            console.error(err);
            res.send();
        });
});