"use strict";
var express = require('express'),
    router = express.Router(),
    utils = rootRequire('app/helpers/utils'),
    installationModel = require('./installationKey.model');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/installation/:key', function (req, res, next) {
    var installationKey = req.params.key;
    if (!utils.isGuid(installationKey)) {
        next();
        return;
    }
    installationModel.getInstallation(installationKey)
        .then(function(installation){
            res.json(installation);
        })
        .catch(function(err){
            res.status(err.statusCode || 500);
            res.send();
        });
});