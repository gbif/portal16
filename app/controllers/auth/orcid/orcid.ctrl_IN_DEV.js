"use strict";
let express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    btoa = require('btoa'),
    atob = require('atob'),
    credentials = rootRequire('config/credentials').auth.orcid,
    //User = require('../../api/user/user.model'),
    //auth = require('../auth.service'),
    //OAuth2Strategy  = require('passport-oauth2').Strategy,
    OrcidStrategy = require('passport-orcid').Strategy;

let scope = '/authenticate';
module.exports = function (app) {
    app.use('/auth', router);
};

router.get('/orcid/connect', passport.authenticate('orcid'));

router.get('/orcid/callback', function (req, res, next) {
    passport.authenticate('orcid', {scope: scope}, function (err, user, info) {
        //TODO to implement - only to see that it all works and we can get info from orcID
        //TODO send to page with option to select username and email and optional password. How to store the userid? encode it as a temporary token?
        res.json({err, user, info});
    })(req, res, next);
});

let clientId = credentials.clientId,
    clientSecret = credentials.clientSecret,
    callbackURL = 'http://localhost:7000/auth/orcid/callback';

passport.use(new OrcidStrategy({
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: callbackURL,
        scope: scope
    },

    // orcid will send back the token and params
    function (accessToken, refreshToken, params, profile, done) {
        //TODO to implement - only to see that it all works and we can get info from orcID
        done(null, {accessToken, refreshToken, params, profile});
    })
);

//passport.use(new OAuth2Strategy({
//        authorizationURL: 'https://orcid.org/oauth/authorize',
//        tokenURL: 'https://pub.orcid.org/oauth/token',
//        clientID: clientId,
//        clientSecret: clientSecret,
//        callbackURL: callbackURL,
//        scope: scope,
//        passReqToCallback : true
//    },
//
//    // orcid will send back the token and params
//    function (accessToken, refreshToken, params, profile, done) {
//        //TODO to implement - only to see that it all works and we can get info from orcID
//        console.log(accessToken, refreshToken, params, profile);
//        done({accessToken, refreshToken, params, profile});
//    })
//);