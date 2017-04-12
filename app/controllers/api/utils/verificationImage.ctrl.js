"use strict";
let express = require('express'),
    //path = require('path'),
    //verifier = require('../../../models/verification/verification'),
    router = express.Router();

module.exports = function (app) {
    app.use('/api/verification', router);
};

router.get('/image/:id/:name', function (req, res, next) {
    next();
    //verifier.resolveImageName(req.params.id, req.params.name, function(err, location){
    //    if (!err) {
    //        res.sendFile(location);
    //    } else {
    //        res.status(404);
    //        res.send();
    //    }
    //});
});

router.get('/challenge', function (req, res, next) {
    next();
    //verifier.getChallenge(function(err, challenge){
    //    if (!err) {
    //        res.json(challenge);
    //    } else {
    //        res.status(500);
    //        res.send('failed to get challenge');
    //    }
    //});
});