"use strict";

var apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    chai = require('chai'),
    expect = chai.expect,
    querystring = require('querystring'),
    credentialsPath = rootRequire('config/config').credentials,
    credentials = require(credentialsPath).directory,
    secret = credentials.secret,
    jwt = require('jsonwebtoken'),
    authOperations = require('./gbifAuthRequest');

module.exports = {
    create: create,
    confirm: confirm,
    findBySession: findBySession
};

async function create(body) {
    let options = {
        method: 'POST',
        body: body,
        url: apiConfig.user.url,
        canonicalPath: apiConfig.user.canonical
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 201) {
        throw response;
    }
    return response.body;
}

async function confirm(challengeCode, userName) {
    let options = {
        method: 'POST',
        body: {
            challengeCode: challengeCode
        },
        url: apiConfig.userConfirm.url,
        canonicalPath: apiConfig.userConfirm.canonical,
        userName: userName
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 201) {
        throw response;
    }
    return response.body;
}

async function findBySession(session){
    let user = await authOperations.getUserFromToken(session);
    return user;
}

// async function findById(userName) {
//     return {
//         userName: userName,
//         somevalue: Math.random()
//     };
//
//     // let options = {
//     //     method: 'GET',
//     //     url: apiConfig.userID.url
//     // };
//     // let response = await authOperations.authenticatedRequest(options);
//
//     // if (response.statusCode !== 201) {
//     //     throw response;
//     // }
//     // return response.body;
// }
//
//async function getUserDownloads(cookie, query) {
//    query = query || {};
//    expect(cookie, 'user token').to.be.a('string');
//    expect(query, 'download query').to.be.an('object');
//
//    let user = await authOperations.getUserFromToken(cookie);
//
//    let options = {
//        url: apiConfig.occurrenceDownloadUser.url + user.userName + '?' + querystring.stringify(query),
//        userName: user.userName,
//        method: 'GET'
//    };
//
//    let previousUserDownloads = await authOperations.authenticatedRequest(options);
//    return previousUserDownloads;
//}
//
//
//async function createSimpleDownload(cookie, query) {
//    query = query || {};
//    expect(cookie, 'user token').to.be.a('string');
//    expect(query, 'download query').to.be.an('object');
//
//    let user = await authOperations.getUserFromToken(cookie);
//
//    query.notification_address = user.email || 'an_email_is_required_despite_not_needing_it';
//    var options = {
//        url: apiConfig.occurrenceSearchDownload.url + '?' + querystring.stringify(query),
//        userName: user.userName,
//        type: 'PLAIN',
//        method: 'GET'
//    };
//
//    let download = await authOperations.authenticatedRequest(options);
//    return download;
//}