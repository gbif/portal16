'use strict';
let express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    User = require('../../api/user/user.model'),
    Base64 = require('js-base64').Base64,
    auth = require('../auth.service');

module.exports = function(app) {
    app.use('/api/auth', auth.noCacheMiddleware(), router);
};

router.get('/basic', function(req, res, next) {
    auth.setNoCache(res);
    passport.authenticate('basic', {session: false}, function(err, user, info) {
        let error = err || info;
        if (error) {
            return res.status(401).json({message: 'Unable to verify.'});
        }
        if (!user) {
            return res.status(404).json({message: 'Something went wrong, please try again.'});
        }
        // unfortunately the login api doesn't provide the full user, so we have to get it again
        User.getByUserName(user.userName)
            .then((user) => {
                if (user) {
                    user = User.getClientUser(user);
                    let token = auth.signToken(user);
                    auth.setTokenCookie(res, token);
                    auth.setNoCache(res);

                    res.json({user});
                } else {
                    return res.status(404).json({message: 'Something went wrong, please try again.'});
                }
            })
            .catch(function(err) {
                console.log(Object.keys(err))
                console.log(err.statusCode)
                // TODO it should never happen that a username that just logged in can now not be found again log error
                return res.status(404).json({message: 'Something went wrong, please try again.'});
            });
    })(req, res, next);
});

passport.use(new BasicStrategy(function(userid, password, done) {
    //why URIdecode? https://github.com/jaredhanson/passport-http/issues/20
    let authData = 'Basic ' + Base64.encode(userid + ':' + decodeURIComponent(password));
    User.login(authData)
        .then(function(user) {
            done(null, user);
        })
        .catch((err) => done(err));
}));
