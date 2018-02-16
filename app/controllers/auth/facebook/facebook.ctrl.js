'use strict';
let express = require('express'),
    router = express.Router(),
    domain = rootRequire('config/config').domain,
    credentials = rootRequire('config/credentials').auth.facebook,
    passport = require('passport'),
    _ = require('lodash'),
    btoa = require('btoa'),
    authProviderUtils = require('../authProviderUtils'),
    User = require('../../api/user/user.model'),
    auth = require('../auth.service'),
    FacebookStrategy = require('passport-facebook').Strategy,
    clientId = credentials.clientId,
    clientSecret = credentials.clientSecret,
    callbackURL = domain + '/auth/facebook/callback',
    profileScope = ['id', 'email', 'displayName', 'picture.type(large)'];

module.exports = function(app) {
    app.use('/auth', router);
};

router.get('/facebook/connect', auth.isAuthenticated(), function(req, res, next) {
    let state = {action: 'CONNECT', target: req.headers.referer || '/'};
    let stateB64 = btoa(JSON.stringify(state));
    passport.authenticate('facebook', {scope: 'email', state: stateB64})(req, res, next);
});

router.get('/facebook/disconnect', auth.isAuthenticated(), function(req, res, next) {
    _.set(req.user, 'systemSettings["auth.facebook.id"]', undefined);
    _.set(req.user, 'systemSettings["auth.facebook.photo"]', undefined);
    User.update(req.user.userName, req.user)
        .then(function() {
            res.redirect(302, req.headers.referer || '/');
        })
        .catch(function(err) {
            next(err);
        });
});

router.get('/facebook/login', function(req, res, next) {
    let state = {action: 'LOGIN', target: req.headers.referer || '/'};
    let stateB64 = btoa(JSON.stringify(state));
    passport.authenticate('facebook', {scope: 'email', state: stateB64})(req, res, next);
});

router.get('/facebook/register', function(req, res, next) {
    // add option to add username and country from query param.
    let userName = req.query.userName;
    let countryCode = req.query.countryCode;
    if (!userName || !countryCode) {
        next(new Error('Missing username or countryCode'));
        return;
    }
    let state = {action: 'REGISTER', target: req.headers.referer || '/', userName: userName, countryCode: countryCode};
    let stateB64 = btoa(JSON.stringify(state));
    passport.authenticate('facebook', {scope: 'email', state: stateB64})(req, res, next);
});

router.get('/facebook/callback', auth.appendUser(), function(req, res, next) {
    passport.authenticate('facebook', {session: false}, function(err, profile, info) {
        authProviderUtils.authCallback(req, res, next, err, profile, info, setProviderValues, 'FACEBOOK', 'auth.facebook.id');
    })(req, res, next);
});

function setProviderValues(user, profile) {
    _.set(user, 'systemSettings["auth.facebook.id"]', profile.id);
    _.set(user, 'systemSettings["auth.facebook.photo"]', _.get(profile, 'photos[0].value'));
}

passport.use(new FacebookStrategy({
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: callbackURL,
        profileFields: profileScope
    },

    // orcid will send back the token and params
    function(accessToken, refreshToken, profile, done) {
        // TODO to implement - only to see that it all works and we can get info from orcID
        done(null, profile, {accessToken, refreshToken});
    })
);
