"use strict";
var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    User = require('../../api/user/user.model'),
    btoa = require('btoa'),
    auth = require('../auth.service');

module.exports = function (app) {
    app.use('/api/auth', router);
};

router.get('/basic', function (req, res, next) {
    passport.authenticate('basic', {session: false}, function (err, user, info) {
        var error = err || info;
        if (error) {
            return res.status(401).json({message: 'Unable to verify.'});
        }
        if (!user) {
            return res.status(404).json({message: 'Something went wrong, please try again.'});
        }
        user = User.getClientUser(user);
        var token = auth.signToken(user);
        auth.setTokenCookie(res, token);
        auth.setNoCache(res);
        res.json({user});
    })(req, res, next);
});

passport.use(new BasicStrategy(function (userid, password, done) {
    var authData = 'Basic ' + btoa(userid + ':' + password);
    User.login(authData)
        .then(function (user) {
            done(null, user);
        })
        .catch(err => done(err));
}));