'use strict';
let credentialsPath = rootRequire('config/config').credentials,
    credentials = require(credentialsPath).directory,
    secret = credentials.secret,
    jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt'),
    compose = require('composable-middleware'),
    isNotDevBuild = require('../../../config/config').env !== 'dev', //it is convenient to set cookies on localhost so don't require secure cookies for dev builds
    User = require('../api/user/user.model'),
    _ = require('lodash'),
    verification = rootRequire('app/models/verification/verification'); //this folder needs to be configured to work. Once the authentication is ready we could consider this home made verifaction.

var validateJwt = expressJwt({
    secret: secret
});

module.exports = {
    isAuthenticated: isAuthenticated,
    signToken: signToken,
    setTokenCookie: setTokenCookie,
    removeTokenCookie: removeTokenCookie,
    setNoCache: setNoCache,
    isHumanEnough: isHumanEnough
};

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
    return compose()
    // Validate jwt
        .use(function (req, res, next) {
            // allow access_token to be passed through query parameter as well
            if (req.query && req.query.hasOwnProperty('access_token')) {
                req.headers.authorization = `Bearer ${req.query.access_token}`;
            }
            // IE11 forgets to set Authorization header sometimes. Pull from cookie instead. //mgh this strike me as odd (it is copy pasted) - if we then end up always setting it as a cookie, why even bother about adding it as a header as well?
            if (req.query && typeof req.headers.authorization === 'undefined') {
                req.headers.authorization = `Bearer ${req.cookies.token}`;
            }
            validateJwt(req, res, next);
        })
        .use(function (err, req, res, next) {
            if (err.name === 'UnauthorizedError') {
                removeTokenCookie(res);
                res.status(401).send('invalid token...');
            } else if (err) {
                next(err);
            } else {
                next();
            }
        })
        // Attach user to request
        .use(function (req, res, next) {
            setNoCache(res);
            User.getByUserName(req.user.userName)
                .then(user => {
                    if (!user) {
                        return res.status(403).end();
                    }
                    req.user = user;
                    next();
                })
                .catch(function (err) {
                    res.status(err.statusCode || 403);
                    res.json({message: 'INVALID'});
                });
        });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(user, ttl) {
    let tokenContent = {
        userName: user.userName
    };
    let token = jwt.sign(tokenContent, secret, {
        expiresIn: ttl || (60 * 60 * 1) // time in seconds - 1 hour
    });
    return token;
}

/**
 * Sets the token as a secure cookie
 */
let minute = 60000,
    hour =  60*minute,
    day = 24*hour;
function setTokenCookie(res, token) {
    res.cookie('token', token,
        {
            maxAge: day * 300,
            secure: isNotDevBuild,
            httpOnly: true
        }
    );
}

/**
 * Remove token cookie
 */
function removeTokenCookie(res) {
    res.cookie('token', '',
        {
            maxAge: 1,
            secure: isNotDevBuild,
            httpOnly: true
        }
    );
}

/**
 * Don't cache anything if it is an authorized endpoint
 */
function setNoCache(res) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
}


/**
 * Has client answered a human verification correctly
 * Otherwise returns 401
 */
function isHumanEnough() {
    return compose()
        // Test that the request has a body with a challengeCode and a correct answer
        .use(function (req, res, next) {
            let challengeId = _.get(req, 'body.challenge.id'),
                answer = _.get(req, 'body.challenge.answer');
            verification.verify(challengeId, answer, function (isHumanEnough) {
                if (isHumanEnough) {
                    next();
                } else {
                    res.status(401);
                    res.send('HUMAN_VERIFICATION_FAILED');
                }
            });
        });
}