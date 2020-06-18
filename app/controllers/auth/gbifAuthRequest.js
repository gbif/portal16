'use strict';

const credentials = rootRequire('config/credentials').directory,
    appKey = credentials.appKey,
    secret = credentials.secret,
    request = rootRequire('app/helpers/request'),
    chai = require('chai'),
    expect = chai.expect,
    crypto = require('crypto'),
    NEWLINE = '\n';

async function authenticatedRequest(options) {
    // https://github.com/gbif/gbif-common-ws/blob/master/src/main/java/org/gbif/ws/security/GbifAuthService.java
    expect(options).to.be.an('object');
    expect(['GET', 'POST', 'PUT', 'DELETE'], 'request method').to.include(options.method);
    expect('url').to.be.a('string');
    if (options.method == 'POST' || options.method == 'PUT') {
        expect(options.canonicalPath, 'canonicalPath').to.be.a('string');
        expect(options.body, 'POST/PUT body').to.be.an('object');
    }

    let requestOptions = {
        maxAttempts: 5, // (default) try 5 times
        retryDelay: 5000, // (default) wait for 5s before trying again
        fullResponse: true
    };
    requestOptions.method = options.method;
    requestOptions.url = options.url;
    requestOptions.json = options.body;

    let expectJSON = typeof options.json === 'undefined' || options.json;
    if (requestOptions.method == 'GET' && expectJSON) {
        requestOptions.json = true;
    }

    let headers = createHeader(options);
    signHeader(requestOptions.method, headers, expectJSON);
    requestOptions.headers = headers;

    let response = await request(requestOptions);
    return response;
}

function createHeader(options) {
    let headers = {};
    headers['x-url'] = options.canonicalPath || options.url;
    headers['x-gbif-user'] = options.userName || appKey;
    if (options.method == 'POST' || options.method == 'PUT') {
        headers['Content-MD5'] = crypto.createHash('md5').update(JSON.stringify(options.body)).digest('base64');
    }
    return headers;
}

function signHeader(method, headers, isJson) {
    let stringToSign = method + NEWLINE + headers['x-url'];
    if (headers['Content-MD5']) {
        if (isJson) {
            stringToSign += NEWLINE + 'application/json';
        }
        stringToSign += NEWLINE + headers['Content-MD5'];
    }
    if (headers['x-gbif-user']) {
        stringToSign += NEWLINE + headers['x-gbif-user'];
    }
    let signature = crypto.createHmac('sha1', secret).update(stringToSign).digest('base64');
    headers.Authorization = 'GBIF ' + appKey + ':' + signature;
}

module.exports = {
    authenticatedRequest: authenticatedRequest
};
