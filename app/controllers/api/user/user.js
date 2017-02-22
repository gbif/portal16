"use strict";

var Q = require('q'),
    authRequest = require('./authRequest'),
    querystring = require('querystring'),
    apiConfig = require('../../../models/gbifdata/apiConfig');

function getDownloads(cookie, query) {
    query = query || {};
    var deferred = Q.defer();
    var userPromise = authRequest.getUser(cookie);
    userPromise
        .then(function (user) {
            var options = {
                url: apiConfig.occurrenceDownloadUser.url + user.userName + '?' + querystring.stringify(query)
            };
            authRequest.authenticatedRequest(cookie, options)
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

function simpleDownload(cookie, query) {
    query = query || {};
    var deferred = Q.defer();
    var userPromise = authRequest.getUser(cookie);
    userPromise
        .then(function (user) {
            query.notification_address = user.email || 'an_email_is_required_despite_not_needing_it';
            var options = {
                url: apiConfig.occurrenceSearchDownload.url + '?' + querystring.stringify(query),
                type: 'PLAIN'
            };
            authRequest.authenticatedRequest(cookie, options)
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
    getDownloads: getDownloads,
    simpleDownload: simpleDownload,
    getUser: authRequest.getUser
};