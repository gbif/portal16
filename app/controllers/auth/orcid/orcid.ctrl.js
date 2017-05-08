"use strict";
var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    OrcidStrategy = require('passport-orcid').Strategy,
    User = require('../../api/user/user.model'),
    auth = require('../auth.service');


module.exports = function (app) {
    app.use('/auth', router);
};

router.get('/orcid', passport.authenticate('orcid'));

router.get('/orcid/callback', function (req, res, next) {
    passport.authenticate('orcid', {session: false}, function (err, user, info) {
        //TODO to implement - only to see that it all works and we can get info from orcID
        //TODO send to page with option to select username and email and optional password. How to store the userid? encode it as a temporary token?
        res.json({err, user, info});
    })(req, res, next);
});

passport.use(new OrcidStrategy({

        clientID: 'clientid',
        clientSecret: 'clientSecret',
        callbackURL: "http://localhost:7000/auth/orcid/callback"

    },

    // orcid will send back the token and params
    function (accessToken, refreshToken, params, profile, done) {
        //TODO to implement - only to see that it all works and we can get info from orcID
        done({accessToken, refreshToken, params, profile});
    })
);
