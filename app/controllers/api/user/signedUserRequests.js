"use strict";

var apiConfig = require('../../../models/gbifdata/apiConfig'),
    chai = require('chai'),
    expect = chai.expect,
    authOperations = require('./authOperations');

module.exports = {
    createUser: createUser,
    createSimpleDownload: createSimpleDownload,
    getUserDownloads: getUserDownloads
};

function createUser(body) {
    let options = {
        method: 'POST',
        body: body,
        url: apiConfig.user.url,
        canonicalPath: apiConfig.user.canonical
    };
    return authOperations.authenticatedRequest(options);
}

async function getUserDownloads(cookie, query) {
    query = query || {};
    expect(cookie, 'user token').to.be.a('string');
    expect(query, 'download query').to.be.an('object');

    let user = await authOperations.getUserFromToken(cookie);

    let options = {
        url: apiConfig.occurrenceDownloadUser.url + user.userName + '?' + querystring.stringify(query),
        userName: user.userName,
        method: 'GET'
    };

    let previousUserDownloads = await authOperations.authenticatedRequest(options);
    return previousUserDownloads;
}


async function createSimpleDownload(cookie, query) {
    query = query || {};
    expect(cookie, 'user token').to.be.a('string');
    expect(query, 'download query').to.be.an('object');

    let user = await authOperations.getUserFromToken(cookie);

    query.notification_address = user.email || 'an_email_is_required_despite_not_needing_it';
    var options = {
        url: apiConfig.occurrenceSearchDownload.url + '?' + querystring.stringify(query),
        userName: user.userName,
        type: 'PLAIN',
        method: 'GET'
    };

    let download = await authOperations.authenticatedRequest(options);
    return download;
}