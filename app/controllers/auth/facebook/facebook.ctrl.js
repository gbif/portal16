"use strict";
let express = require('express'),
    router = express.Router(),
    passport = require('passport'),
//credentials = rootRequire('config/credentials').auth.facebook,
//User = require('../../api/user/user.model'),
//auth = require('../auth.service'),
    FacebookStrategy = require('passport-facebook').Strategy;

let clientId = 'nonse',
    clientSecret = 'nonse',
    callbackURL = 'http://localhost:7000/auth/facebook/callback',
    profileFields = ['id', 'email', 'displayName', 'picture'];

let facebookConfig = {
    // pull in our app id and secret from our auth.js file
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: callbackURL,
    profileFields: profileFields
};

module.exports = function (app) {
    app.use('/auth', router);
};

router.get('/facebook/connect', function (req, res, next) {
    //perhaps state should be a base64 encoded json. target and action (login|create|connect) ?
    // on the other hand if already logged in, then always connect. if not logged in, then log in or create if non existent (providing option to select username)
    passport.authenticate('facebook', {scope: 'email', state: req.query.state})(req, res, next);
});

router.get('/facebook/callback', function (req, res, next) {
    passport.authenticate('facebook', {session: false}, function (err, user, info) {
        //TODO to implement - only to see that it all works and we can get info from orcID
        //TODO send to page with option to select username and email and optional password. How to store the userid? encode it as a temporary token?
        //console.log(req.query.state);
        //console.log(user);
        //TODO update the user info here based on the returned user
        res.redirect(302, req.query.state);
    })(req, res, next);
});

passport.use(new FacebookStrategy(facebookConfig,

    // facebook will send back the token and profile
    function (token, refreshToken, profile, done) {
        done(null, {token, refreshToken, profile}, {nothing: 'to say'});
    })
);