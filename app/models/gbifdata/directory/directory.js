'use strict';

var crypto = require('crypto'),
    async = require('async'),
    resource = require('../resource'),
    Q = require('q'),
    helper = require('../../util/util'),
    dataApi = require('../apiConfig');

var Directory = function(){};

Directory.getContacts = function() {
    var defer = Q.defer();
    var groups = [
        'executive_committee',
        'science_committee',
        'budget_committee',
        'nodes_committee',
        'nodes_steering_group'
        //'gbif_secretariat'
    ];

    var contacts = {};

    Q.all(groups.map(function(group){
        return getCommitteeContacts(group).then(function(results){
            contacts[group] = results;
            return results;
        });
    }))
    .then(function(results){
        if (results.length > 0) defer.resolve(contacts);
    }, function(err){
        defer.reject(new Error(err));
    });
    return defer.promise;
};

function getCommitteeContacts(group) {
    var deferred = Q.defer();
    var requestUrl = (group == 'gbif_secretariat') ? dataApi.directoryReport.url + '/' + group + '?format=json' : dataApi.directoryCommittee.url + '/' + group;
    var options = authorizeApiCall(requestUrl);

    genericEndpointAccess(requestUrl, options)
        .then(function(results){
            var personsTasks = [];
            results.forEach(function(person){
                personsTasks.push(getPersonContacts(person.personId));
            });

            Q.all(personsTasks).then(function(committee){
                deferred.resolve(committee);
            })
            .catch(function(err){
                deferred.reject(new Error(err));
            });
        })
        .catch(function(err){
            deferred.reject(new Error(err));
        });
    return deferred.promise;
}

function getPersonContacts(persons) {
    var deferred = Q.defer();
    var requestUrl = dataApi.directoryPerson.url + '/' + persons;
    var options = authorizeApiCall(requestUrl, 'directoryPerson');

    genericEndpointAccess(requestUrl, options)
        .then(function(data){
            deferred.resolve(data);
        })
        .catch(function(err){
            deferred.reject(new Error(err));
        });
    return deferred.promise;
}

function genericEndpointAccess(requestUrl, options) {
    var deferred = Q.defer();
    helper.getApiData(requestUrl, function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(new Error(err));
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(new Error(err));
        }
    }, options);
    return deferred.promise;
}

function authorizeApiCall(requestUrl) {
    var appKey = 'gbif.drupal';
    var secret = '6c6d4f43782772442450565b7b386d585f6141635c297171212c524b20';

    var options = {
        url: requestUrl,
        retries: 5,
        method: 'GET',
        headers: {
            'x-gbif-user': appKey,
            'x-url': requestUrl
        }
    };

    var stringToSign = options.method + '\n' + requestUrl + '\n' + appKey;
    var signature = crypto.createHmac('sha1', secret).update(stringToSign).digest('base64');
    options.headers.Authorization = 'GBIF' + ' ' + appKey + ':' + signature;
    return options;
}

module.exports = Directory;