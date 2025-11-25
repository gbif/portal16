'use strict';
let credentials = rootRequire('config/credentials').directory;
let secret = credentials.secret;
let jwt = require('jsonwebtoken');
let expressJwt = require('express-jwt');
let compose = require('composable-middleware');
let isNotDevBuild = require('../../../config/config').env !== 'dev';
// it is convenient to set cookies on localhost so don't require secure cookies for dev builds
let User = require('../api/user/user.model');
let _ = require('lodash');
let verification = rootRequire('app/models/verification/verification');
// this folder needs to be configured to work. Once the authentication is ready we could consider this home made verifaction.
let log = require('../../../config/log');
let minute = 60000;
let hour = 60 * minute;
let day = 24 * hour;

let validateJwt = expressJwt({
    secret: secret
});

module.exports = {
    isAuthenticated: isAuthenticated,
    signToken: signToken,
    setTokenCookie: setTokenCookie,
    removeTokenCookie: removeTokenCookie,
    setNoCache: setNoCache,
    noCacheMiddleware: noCacheMiddleware,
    isHumanEnough: isHumanEnough,
    appendUser: appendUser,
    logUserIn: logUserIn
};

function setTokenInHeader(req) {
    // allow access_token to be passed through query parameter as well
    if (req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = `Bearer ${req.query.access_token}`;
    }
    // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
    // mgh this strike me as odd (it is copy pasted) - if we then end up always setting it as a cookie, why even bother about adding it as a header as well?
    if (req.query && typeof req.headers.authorization === 'undefined') {
        req.headers.authorization = `Bearer ${req.cookies.token}`;
    }
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
    return compose()
        // Validate jwt
        .use(function (req, res, next) {
            // // allow access_token to be passed through query parameter as well
            // if (req.query && req.query.hasOwnProperty('access_token')) {
            //    req.headers.authorization = `Bearer ${req.query.access_token}`;
            // }
            // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
            // mgh this strike me as odd (it is copy pasted) - if we then end up always setting it as a cookie, why even bother about adding it as a header as well?
            // if (req.query && typeof req.headers.authorization === 'undefined') {
            //    req.headers.authorization = `Bearer ${req.cookies.token}`;
            // }
            setTokenInHeader(req);
            validateJwt(req, res, next);
        })
        .use(function (err, req, res, next) {
            if (err.name === 'UnauthorizedError') {
                setNoCache(res);
                removeTokenCookie(res);
                log.info({ url: req.url }, 'Invalid user token detected.');
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
                .then((user) => {
                    if (!user) {
                        return res.status(403).end();
                    }
                    req.user = user;
                    next();
                })
                .catch(function (err) {
                    res.status(err.statusCode || 403);
                    res.json({ message: 'INVALID' });
                });
        });
}

/**
 * Append user from token if available - unlike 'isAuthenticated' this does not block the route, but simply appends the user
 */
function appendUser() {
    return compose()
        // Attach user to request
        .use(function (req, res, next) {
            setNoCache(res);
            setTokenInHeader(req);
            validateJwt(req, res, function (val) {
                if (_.isUndefined(val)) {
                    User.getByUserName(req.user.userName)
                        .then((user) => {
                            if (user) {
                                req.user = user;
                            } else {
                                removeTokenCookie(res);
                                delete req.user;
                            }
                            next();
                        })
                        .catch(function (err) {
                            if (err.statusCode == 204) {
                                removeTokenCookie(res);
                                delete req.user;
                                next();
                            } else {
                                next(err);
                            }
                        });
                } else {
                    delete req.user;
                    next();
                }
            });
        });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(user, ttl) {
    let tokenContent = {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName
    };
    if (user.roles) {
        tokenContent.roles = JSON.stringify(user.roles);
    }
    let token = jwt.sign(tokenContent, secret, {
        expiresIn: ttl || (60 * 60 * 24 * 7) // time in seconds - 7 days
    });
    return token;
}

function logUserIn(res, user) {
    let clientUser = User.getClientUser(user);
    let token = signToken(clientUser);
    setTokenCookie(res, token);
    setNoCache(res);
}

/**
 * Sets the token as a secure cookie
 */
function setTokenCookie(res, token) {
    let options = {
        maxAge: day * 7,
        secure: isNotDevBuild,
        httpOnly: false,
        // sameSite: isNotDevBuild
    };
    res.cookie('token', token, options);
}

/**
 * Remove token cookie
 */
function removeTokenCookie(res) {
    let options = {
        maxAge: 1,
        secure: isNotDevBuild,
        httpOnly: false
    };
    res.cookie('token', '', options);
}

/**
 * Don't cache anything if it is an authorized endpoint
 */
function setNoCache(res) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
}

function noCacheMiddleware() {
    return compose()
        // Validate jwt
        .use(function (req, res, next) {
            setNoCache(res);
            next();
        });
}


/**
 * Has client answered a human verification correctly
 * Otherwise returns 401
 */
function isHumanEnough() {
    return compose()
        // Test that the request has a body with a challengeCode and a correct answer
        .use(function (req, res, next) {
            let challengeId = _.get(req, 'body.challenge.id');
            let answer = _.get(req, 'body.challenge.answer');
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
