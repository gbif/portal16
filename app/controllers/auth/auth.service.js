'use strict';
let credentialsPath = rootRequire('config/config').credentials,
    credentials = require(credentialsPath).directory,
    secret = credentials.secret,
    jwt = require('jsonwebtoken'),
    expressJwt = require('express-jwt'),
    compose = require('composable-middleware'),
    User = require('../api/user/user.model');

var validateJwt = expressJwt({
  secret: secret
});

module.exports = {
    isAuthenticated: isAuthenticated,
    signToken: signToken
};

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = `Bearer ${req.query.access_token}`;
      }
     // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
      if(req.query && typeof req.headers.authorization === 'undefined') {
        req.headers.authorization = `Bearer ${req.cookies.token}`;
      }
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      User.findBySession(req.user.session)
        .then(user => {
          if(!user) {
            return res.status(401).end();
          }
          req.user = user;
          next();
        })
        .catch(err => next(err));
    });
}

// /**
//  * Checks if the user role meets the minimum requirements of the route
//  */
// export function hasRole(roleRequired) {
//   if(!roleRequired) {
//     throw new Error('Required role needs to be set');
//   }
//
//   return compose()
//     .use(isAuthenticated())
//     .use(function meetsRequirements(req, res, next) {
//       if(config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
//         return next();
//       } else {
//         return res.status(403).send('Forbidden');
//       }
//     });
// }

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if(!req.user) {
    return res.status(404).send('It looks like you aren\'t logged in, please try again.');
  }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', token);
  res.redirect('/');
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(user, ttl){
    let tokenContent = {
        userName: user.userName,
        session: user.session //this pretty much defeats the purpose, butuntil the api supports getting users by id or username, this is the best i can do
    };
    let token = jwt.sign(tokenContent, secret, {
        expiresIn: ttl || (60 * 60 * 5)
    });
    return token;
}