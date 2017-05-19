"use strict";

const credentials = rootRequire('config/config').credentials.directory,
    appKey = credentials.appKey,
    secret = credentials.secret,
    request = require('requestretry'),
    chai = require('chai'),
    expect = chai.expect,
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    crypto = require('crypto'),
    NEWLINE = '\n';

function getUserFromToken(userSessionCookie) {
    var userRequest = {
        url: apiConfig.user.url,
        maxAttempts: 5,   // (default) try 5 times
        retryDelay: 5000,  // (default) wait for 5s before trying again
        retryStrategy: request.RetryStrategies.HTTPOrNetworkError, // (default) retry on 5xx or network errors
        timeout: 30000,
        method: 'GET',
        headers: {
            'x-gbif-user-session': userSessionCookie
        }
    };
    return request(userRequest);
}

async function authenticatedRequest(options) {
    //https://github.com/gbif/gbif-common-ws/blob/master/src/main/java/org/gbif/ws/security/GbifAuthService.java
    expect(options).to.be.an('object');
    expect(['GET', 'POST', 'PUT'], 'request method').to.include(options.method);
    expect('url').to.be.a('string');
    if (options.method == 'POST' || options.method == 'PUT') {
        expect(options.canonicalPath, 'canonicalPath').to.be.a('string');
        expect(options.body, 'POST/PUT body').to.be.an('object');
    }

    let requestOptions = {
        maxAttempts: 5,   // (default) try 5 times
        retryDelay: 5000,  // (default) wait for 5s before trying again
        retryStrategy: request.RetryStrategies.HTTPOrNetworkError, // (default) retry on 5xx or network errors
        fullResponse: false
    };
    requestOptions.method = options.method;
    requestOptions.url = options.url;
    requestOptions.body = options.body;

    var header = createHeader(options);
    signHeader(requestOptions.method, header);
    requestOptions.headers = header;

    let data = await request(requestOptions);
    return data;
}

function createHeader(options) {
    options.headers['x-url'] = options.canonicalPath || options.url;
    options.headers['x-gbif-user'] = options.userName || appKey;
    //if (options.userName) {
    //    options.headers['x-gbif-user'] = options.userName;
    //}
    if (options.method == 'POST' || options.method == 'PUT') {
        options.headers['Content-MD5'] = crypto.createHash('md5').update(JSON.stringify(options.json)).digest("base64");
    }
}

function signHeader(method, headers) {
    var stringToSign = method + NEWLINE + headers['x-url'] + NEWLINE + 'application/json';
    if (headers['Content-MD5']) {
        stringToSign += NEWLINE + headers['Content-MD5'];
    }
    if (headers['x-gbif-user']) {
        stringToSign += NEWLINE + headers['x-gbif-user'];
    }
    var signature = crypto.createHmac('sha1', secret).update(stringToSign).digest('base64');
    headers.Authorization = 'GBIF ' + appKey + ':' + signature;
}

//function authenticatedRequestFromCookie(cookie, options) {
//    var deferred = Q.defer();
//    var userPromise = getUserFromToken(cookie);
//    userPromise
//        .then(function (user) {
//            options.userName = user.userName;
//            authenticatedRequest(options)
//                .then(function (response) {
//                    deferred.resolve(response);
//                })
//                .fail(function (err) {
//                    deferred.reject(err);
//                });
//        })
//        .fail(function (err) {
//            deferred.reject(err);
//        });
//    return deferred.promise;
//}

module.exports = {
    getUserFromToken: getUserFromToken,
    //authenticatedRequestFromCookie: authenticatedRequestFromCookie,
    authenticatedRequest: authenticatedRequest
};