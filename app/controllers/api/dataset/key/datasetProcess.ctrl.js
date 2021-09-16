'use strict';
let express = require('express'),
    router = express.Router(),
    utils = rootRequire('app/helpers/utils'),
    auth = require('../../../auth/auth.service'),
    datasetAuth = require('./datasetAuth'),
    processModel = require('./datasetProcess.model');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/dataset/:key/processSummary', function(req, res, next) {
    let datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        next();
        return;
    }
    processModel.getProcessSummary(datasetKey)
        .then(function(processSummary) {
            res.json(processSummary);
        })
        .catch(function(err) {
            res.status(err.statusCode || 500);
            res.send();
        });
});

router.get('/dataset/:key/crawling', function(req, res, next) {
    let datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        next();
        return;
    } else {
        res.setHeader('Cache-Control', 'public, max-age=5'); // 5 seconds
        processModel.crawlStatus(datasetKey)
            .then(function(currentCrawl) {
                if (currentCrawl) {
                    res.json(currentCrawl);
                } else {
                    res.status(204);
                    res.send();
                }
            })
            .catch(function(err) {
                res.status(err.statusCode || 500);
                res.send();
                // TODO log error
            });
    }
});

/**
 * Start crawling a dataset. authenticate that the user have access to do so
 */
router.post('/dataset/:key/crawl', auth.isAuthenticated(), datasetAuth.isTrustedContact(), function(req, res, next) {
    let datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        res.status(400);
        res.send();
    } else {
        res.setHeader('Cache-Control', 'public, max-age=0');
        processModel.startCrawling(datasetKey)
            .then(function() {
                res.status(204);
                res.send();
            })
            .catch(function(err) {
                res.status(err.statusCode || 500);
                res.send();
                // TODO log error
            });
    }
});
