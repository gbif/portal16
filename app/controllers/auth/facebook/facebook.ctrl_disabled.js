"use strict";
let express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    credentialsPath = rootRequire('config/config').credentials,
    credentials = require(credentialsPath).auth.facebook,
    FacebookStrategy = require('passport-facebook').Strategy,
    User = require('../../api/user/user.model'),
    auth = require('../auth.service');


module.exports = function (app) {
    app.use('/auth', router);
};

router.get('/facebook', passport.authenticate('facebook', { scope : 'email' }));

router.get('/facebook/callback', function (req, res, next) {
    passport.authenticate('facebook', { session: false }, function (err, user, info) {
        //TODO to implement - only to see that it all works and we can get info from orcID
        //TODO send to page with option to select username and email and optional password. How to store the userid? encode it as a temporary token?
        res.json({err, user, info});
    })(req, res, next);
});

let clientId = credentials.clientId,
    clientSecret = credentials.clientSecret,
    callbackURL = 'http://localhost:7000/auth/facebook/callback',
    profileFields = ['id', 'email', 'displayName', 'picture'];

passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : clientId,
        clientSecret    : clientSecret,
        callbackURL     : callbackURL,
        profileFields   : profileFields

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
        //TODO to implement - only to see that it all works and we can get info from orcID
        done({token, refreshToken, profile});
    })
);