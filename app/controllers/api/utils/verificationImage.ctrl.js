"use strict";
let express = require('express'),
    verifier = require('../../../models/verification/verification'),
    auth = require('../../auth/auth.service'),
    router = express.Router();

module.exports = function (app) {
    app.use('/api/verification', router);
};

router.get('/image', function (req, res) {
    verifier.resolveImageName(req.query.id, function(err, location){
        if (!err) {
            auth.setNoCache(res);
            res.sendFile(location);
        } else {
            res.status(404);
            res.send();
        }
    });
});

router.get('/challenge', function (req, res) {
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