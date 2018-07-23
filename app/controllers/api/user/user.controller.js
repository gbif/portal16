'use strict';
let userModel = require('./user.model'),
    auth = require('../../auth/auth.service'),
    _ = require('lodash'),
    querystring = require('querystring'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    request = require('requestretry'),
    log = require('../../../../config/log');

module.exports = {
    create: create,
    confirm: confirm,
    me: me,
    update: update,
    resetPassword: resetPassword,
    updateForgottenPassword: updateForgottenPassword,
    logout: logout,
    getDownloads: getDownloads,
    createSimpleDownload: testForDuplicateThenCreateSimpleDownload,
    changePassword: changePassword,
    cancelDownload: cancelDownload
};

/**
 * Creates a new user
 */
function create(req, res) {
    let user = {
        userName: req.body.user.userName,
        email: req.body.user.email,
        password: req.body.user.password,
        firstName: req.body.user.firstName,
        lastName: req.body.user.lastName,
        settings: {
            country: req.body.user.settings.country
        }
    };
    userModel.create(user)
        .then(function() {
            res.status(201);
            auth.setNoCache(res);
            res.json({type: 'CONFIRM_MAIL'});
        })
        .catch(function(err) {
            if (err.statusCode < 500) {
                res.status(err.statusCode || 422);
                res.json(err.body);// We trust that the API will never send a body with sensitive data since the endpoint is public.
            } else {
                log.error(err);
                res.sendStatus(500);
            }
        });
}

/**
 * Confirm user creation from mail link
 */
function confirm(req, res) {
    let challengeCode = req.query.code,
        userName = req.query.username;

    userModel.confirm(challengeCode, userName)
        .then(function(user) {
            let token = auth.signToken(user);
            user = userModel.getClientUser(user);
            auth.setTokenCookie(res, token);
            res.json({user});
        })
        .catch(handleError(res));
}

/**
 * Gets the user associated with my token
 */
function me(req, res) {
    if (!req.user) {
        res.status(204);
        res.send();
    } else {
        res.send(userModel.getClientUser(req.user));
    }
}

/**
 * Updates the user after sanitizing body
 */
function update(req, res) {
    // users are not allowed to change username and system settings area
    let user = userModel.sanitizeUpdatedUser(req.body);
    user.userName = req.user.userName;
    user.roles = req.user.roles;
    user.systemSettings = req.user.systemSettings;

    userModel.update(req.user.userName, user)
        .then(function(resp) {
            res.json(resp);
        })
        .catch(handleError(res, 422));
}

/**
 * ASk for a new password to be sent to the user associated with the username or email
 */
function resetPassword(req, res) {
    userModel.resetPassword(req.body.userNameOrEmail)
        .then(function() {
            res.json({message: 'MAIL_CONFIRMATION'});
        })
        .catch(handleError(res, 422));
}

/**
 * Updates the password given a short lived token sent to the users email
 */
function updateForgottenPassword(req, res) {
    userModel.updateForgottenPassword(req.body)
        .then(function(user) {
            let token = auth.signToken(user);
            user = userModel.getClientUser(user);
            auth.setTokenCookie(res, token);
            res.json({user});
        })
        .catch(handleError(res, 422));
}

/**
 * Change my password using the existing as authentication
 */
function changePassword(req, res) {
    userModel.changePassword(req.get('authorization'), req.body.password)
        .then(function() {
            res.status(204);
            res.json({type: 'PASSWORD_CHANGED'});
        })
        .catch(handleError(res, 422));
}

/**
 * Get my downloads
 */
function getDownloads(req, res) {
    userModel.getDownloads(req.user.userName, req.query)
        .then(function(downloads) {
            res.setHeader('Cache-Control', 'private, max-age=' + 10); // 10 seconds - allow the user to store the list of downloads locally
            res.json(downloads);
        })
        .catch(handleError(res, 422));
}

/**
 * Initiate a simple download based on query parameters.
 */
function createSimpleDownload(req, res) {
    userModel.createSimpleDownload(req.user, req.query)
        .then(function(download) {
            res.json(download);
        })
        .catch(handleError(res, 422));
}

/**
 * Cancel a download the user has initiated
 */
function cancelDownload(req, res) {
    userModel.cancelDownload(req.user, req.params.key)
        .then(function() {
            res.status(204);
            res.send();
        })
        .catch(handleError(res, 422));
}

/**
 * Logout the user - simply remove the token cookie
 */
function logout(req, res) {
    auth.removeTokenCookie(res);
    res.send('Logged out');
}

/**
 * Initiate a simple download based on query parameters.
 * UPDATE: Hack on behalf of the API where it probably ought to be done.
 * Due to many downloads without any filters it has been decided to redirect such queries to an older pregenerated version.
 * So first check if there exists any such, if so redirect to that. Else create new download.
 */
function testForDuplicateThenCreateSimpleDownload(req, res) {
    delete req.query.locale;
    delete req.query.advanced;
    getPregeneratedVersion(req.query)
        .then(function(match) {
            if (match) {
                res.send(match.key);
            } else {
                createSimpleDownload(req, res);
            }
        })
        .catch(handleError(res, 422));
}

async function getPregeneratedVersion(query) {
    let predicate = await getPredicate(query);
    let pQuery = _.get(predicate, 'predicate');
    let pregeneratedDownloads = await userModel.getDownloads('download.gbif.org', {limit: 100, offset: 0});

    let match = _.find(pregeneratedDownloads.results, function(e) {
        let pOther = _.get(e, 'request.predicate');
        return e.status === 'SUCCEEDED' && _.isEqual(pQuery, pOther) && _.get(e, 'request.format') === predicate.format;
    });
    return match;
}

/*
A hack to compensate for a missing API option to return a pregerenated version if available.
*/
async function getPredicate(query) {
    let options = {
        url: apiConfig.occurrenceSearch.url + 'predicate?' + querystring.stringify(query),
        method: 'GET',
        maxAttempts: 1,
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw new Error('Failed API query');
    }
    return response.body;
}

function handleError(res, statusCode) {
   statusCode = statusCode || 500;
   return function(err) {
        if (statusCode < 500) {
            log.warn(err);
        } else {
            log.error(err);
        }
        res.sendStatus(err.statusCode || statusCode);
   };
}

