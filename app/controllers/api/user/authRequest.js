"use strict";

var credentialsPath = rootRequire('config/config').credentials,
    credentials = require(credentialsPath).directory,
    appKey = credentials.appKey,
    secret = credentials.secret,
    request = require('request'),
    _ = require('lodash'),
    Q = require('q'),
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    helper = require('../../../models/util/util'),
    crypto = require('crypto'),
    querystring = require('querystring'),
    NEWLINE = '\n';

function requestPromise(queryOptions) {
    var deferred = Q.defer();
    helper.getApiData(queryOptions.url, function (err, data) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(data);
        }
    }, queryOptions);
    return deferred.promise;
}

function getUser(userSessionCookie) {
    var cookie = request.cookie(apiConfig.cookieNames.userSession + '=' + userSessionCookie),
        userRequest = {
            url: apiConfig.user.url,
            retries: 5,
            timeout: 30000,
            method: 'GET',
            headers: {
                Cookie: cookie
            },
            failHard: true
        };
    return requestPromise(userRequest);
}

function buildAuthenticatedRequest(options, user) {
    //only works for get requests currently . should be expanded to encode body for posts and whatever is necessary for put and delete. It isn't clear from the docs for me
    //https://github.com/gbif/gbif-common-ws/blob/master/src/main/java/org/gbif/ws/security/GbifAuthService.java
    try {
        options.headers = {
            'x-gbif-user': user.userName,
            'x-url': options.url
        };
        options.method = options.method || 'GET';

        var stringToSign = options.method + NEWLINE + options.url + NEWLINE + user.userName;
        var signature = crypto.createHmac('sha1', secret).update(stringToSign).digest('base64');
        options.headers.Authorization = 'GBIF ' + appKey + ':' + signature;

        return requestPromise(options);
    } catch (err) {
        var deferred = Q.defer();
        deferred.reject(err);
        return deferred.promise;
    }
}

function authenticatedRequest(cookie, options) {
    var deferred = Q.defer();
    var userPromise = getUser(cookie);
    userPromise
        .then(function (user) {
            buildAuthenticatedRequest(options, user)
                .then(function (response) {
                    deferred.resolve(response);
                })
                .fail(function (err) {
                    deferred.reject(err);
                });
        })
        .fail(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
}

module.exports = {
    authenticatedRequest: authenticatedRequest,
    getUser: getUser
};