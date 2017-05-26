"use strict";
var express = require('express'),
    router = express.Router(),
    utils = rootRequire('app/helpers/utils'),
    publisherModel = require('./publisherKey.model');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/publisher/:key', function (req, res, next) {
    var publisherKey = req.params.key;
    if (!utils.isGuid(publisherKey)) {
        next();
        return;
    }
    publisherModel.getPublisher(publisherKey)
        .then(function(publisher){
            res.json(publisher);
        })
        .catch(function(err){
            res.status(err.statusCode || 500);
            res.send();
        });
});