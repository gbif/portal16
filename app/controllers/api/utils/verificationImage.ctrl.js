"use strict";
let express = require('express'),
    verifier = require('../../../models/verification/verification'),
    auth = require('../../auth/auth.service'),
    router = express.Router();

module.exports = function (app) {
    app.use('/api/verification', router);
};

router.get('/image/:id/:name', function (req, res, next) {
    verifier.resolveImageName(req.params.id, req.params.name, function(err, location){
        if (!err) {
            auth.setNoCache(res);
            res.sendFile(location);
        } else {
            res.status(404);
            res.send();
        }
    });
});

router.get('/challenge', function (req, res, next) {
    verifier.getChallenge(function(err, challenge){
        if (!err) {
            auth.setNoCache(res);
            res.json(challenge);
        } else {
            res.status(500);
            res.send('failed to get challenge');
        }
    });
});