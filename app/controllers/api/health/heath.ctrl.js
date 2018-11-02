'use strict';

let express = require('express'),
    router = express.Router(),
    notification = require('./notifications.model'),
    portalHealth = require('./portalHealth'),
    log = require('../../../../config/log');

 let notificationsComplete = notification().catch(function(err) {
     log.warn({module: 'api/health'}, err); // the health couldn't be resolved within the timeout after startup
 });

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/health', function(req, res) {
    notificationsComplete
        .then(function(getStatus) {
            let status = getStatus();
            res.setHeader('Cache-Control', 'public, max-age=5'); // 5 seconds
            res.json(status);
        })
        .catch(function() {
            // TODO log error ?
            res.status(500);
            res.send();
        });
});

router.get('/health/ping', function(req, res) {
    notificationsComplete
        .then(function(getStatus) {
            let status = getStatus();
            res.setHeader('Cache-Control', 'public, max-age=5'); // 5 seconds
            if (req.query.hash !== status.hash) {
                res.json(status);
            } else {
                res.status(204);
                res.send();
            }
        })
        .catch(function() {
            // TODO log error ?
            res.status(500);
            res.send();
        });
});

router.get('/health/portal', function(req, res) {
    portalHealth.getHealth(req.__)
        .then(function(status) {
            res.setHeader('Cache-Control', 'public, max-age=5'); // 5 seconds
            if (req.query.hash !== status.hash) {
                res.json(status);
            } else {
                res.status(204);
                res.send();
            }
        })
        .catch(function(err) {
            // TODO log error ?
            // console.log(err); //TODO log
            res.status(500);
            res.send();
        });
});
