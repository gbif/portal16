'use strict';

let Q = require('q'),
    authRequest = require('./authRequest'),
    querystring = require('querystring'),
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    isNotDevBuild = require('../../../../config/config').env !== 'dev', // it is convenient to set cookies on localhost so don't require secure cookies for dev builds
    minute = 60000,
    hour = 60*minute,
    day = 24*hour;

function getDownloads(cookie, query) {
    query = query || {};
    let deferred = Q.defer();
    let userPromise = authRequest.getUser(cookie);
    userPromise
        .then(function(user) {
            let options = {
                url: apiConfig.occurrenceDownloadUser.url + user.userName + '?' + querystring.stringify(query)
            };
            authRequest.authenticatedRequest(cookie, options)
                .then(function(response) {
                    deferred.resolve(response);
                })
                .fail(function(err) {
                    deferred.reject(err);
                });
        })
        .fail(function(err) {
            deferred.reject(err);
        });
    return deferred.promise;
}

function simpleDownload(cookie, query) {
    query = query || {};
    let deferred = Q.defer();
    let userPromise = authRequest.getUser(cookie);
    userPromise
        .then(function(user) {
            query.notification_address = user.email || 'an_email_is_required_despite_not_needing_it';
            let options = {
                url: apiConfig.occurrenceSearchDownload.url + '?' + querystring.stringify(query),
                type: 'PLAIN'
            };
            authRequest.authenticatedRequest(cookie, options)
                .then(function(response) {
                    if (response.errorType) {
                        deferred.reject(response);
                    } else {
                        deferred.resolve(response);
                    }
                })
                .fail(function(err) {
                    deferred.reject(err);
                });
        })
        .fail(function(err) {
            deferred.reject(err);
        });
    return deferred.promise;
}

function login(req, res) {
    let auth = req.get('authorization'),
        loginRequest = {
            url: apiConfig.userLogin.url,
            retries: 5,
            timeout: 30000,
            method: 'GET',
            headers: {
                authorization: auth
            },
            failHard: true
        };

    authRequest.requestPromise(loginRequest).then(function(data) {
        res.cookie('USER_SESSION', data.session,
            {
                maxAge: day*300,
                secure: isNotDevBuild,
                httpOnly: true
            }
        );
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
        res.send(data.user);// only send the user data, not the token. it shouldn't be accessible through JS
    }, function(err) {
        errorUnwrapper(res, err);
    });
}

function logout(req, res) {
    cookieRequest(req, apiConfig.userLogout.url).then(function(data) {
        res.cookie('USER_SESSION', '',
            {
                maxAge: 1,
                secure: isNotDevBuild,
                httpOnly: true
            }
        );
        res.json(data);
    }, function(err) {
        errorUnwrapper(res, err);
    });
}

function getUser(req, res) {
    cookieRequest(req, apiConfig.user.url).then(function(data) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
        res.json(data);
    }, function(err) {
        errorUnwrapper(res, err);
    });
}

function create(userInfo, req, res) {
    return authRequest.create(userInfo).then(function(data) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');

        res.json(data);
    }, function(err) {
        errorUnwrapper(res, err);
    });
}

function cookieRequest(req, url) {
    let cookie = req.cookies[apiConfig.cookieNames.userSession];
    if (cookie) {
        let requestConfig = {
            url: url,
            retries: 1,
            timeout: 30000,
            method: 'GET',
            failHard: true,
            headers: {
                'x-gbif-user-session': cookie
            }
        };
        return authRequest.requestPromise(requestConfig);
    } else {
        let deferred = Q.defer();
        deferred.reject({
            errorResponse: {
                statusCode: 401,
                statusMessage: 'Unauthorized'
            }
        });
        return deferred.promise;
    }
}

function errorUnwrapper(res, err) {
    if (err.errorResponse) {
        res.status(err.errorResponse.statusCode);
        res.send(err.errorResponse.statusMessage);
    } else {
        res.status(500);
        res.send('Could not process request');
    }
}


module.exports = {
    getDownloads: getDownloads,
    simpleDownload: simpleDownload,
    login: login,
    logout: logout,
    getUser: getUser,
    create: create
};
