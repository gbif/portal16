'use strict';

var crypto = require('crypto'),
    _ = require('lodash'),
    Q = require('q'),
    helper = require('../../util/util'),
    fs = require('fs'),
    dataApi = require('../apiConfig');

var Directory = {};

Directory.getContacts = function() {
    var deferFs = Q.defer();
    var defer = Q.defer();
    var groups = [
        'executive_committee',
        'science_committee',
        'budget_committee',
        'nodes_committee',
        'nodes_steering_group'
        //'gbif_secretariat'
    ];

    var contacts = {
        'participants': [],
        'peopleByParticipants': [],
        'committees': [],
        'people': []
    };

    // First check whether we have the credential to complete all the calls to
    // the directory.
    fs.exists('/etc/portal16/credentials.json', deferFs.resolve);

    deferFs.promise
        .then((exists) => {
            if (exists) {
                return Q.all(groups.map(function(group){
                    return getCommitteeContacts(group, contacts).then(function(results){
                        var committee = {
                            'enum': group,
                            'members': results
                        };
                        return contacts.committees.push(committee);
                    });
                }))
            }
            else {
                throw new Error('No credential available.');
            }
        })
        .then(function(){
            return getParticipantsContacts(contacts).then(function(groupedP){
                contacts.participants = groupedP;

                // Make sure the country code comes from Participant entity
                var participantPeople = [];
                groupedP.forEach(function(p){
                    var memberObj = {
                        'enum': p.enum,
                        'people': []
                    };
                    p.members.forEach(function(member){
                        member.people.forEach(function(person){
                            if (member.hasOwnProperty('countryCode')) person.participantCountry = member.countryCode;
                            if (member.hasOwnProperty('countryCode') && !person.hasOwnProperty('countryCode')) {
                                person.countryCode = member.countryCode;
                            }
                            person.participantName = member.name;
                            memberObj.people.push(person);
                        });
                    });
                    memberObj.people = _.orderBy(memberObj.people, [person => person.countryCode, person => person.role], ['asc', 'desc']);
                    participantPeople.push(memberObj);
                });
                contacts.peopleByParticipants = participantPeople;

                // For filtering
                // 1) de-duplication
                contacts.people = _.uniqBy(contacts.people, 'id');
                contacts.people = _.orderBy(contacts.people, [person => person.surname.toLowerCase(), ['asc']]);

                // 2) strip people details
                contacts.people.forEach(function(p, i){
                    var strippedP = {};
                    strippedP.name = p.firstName + ' ' + p.surname;
                    contacts.people[i] = strippedP;
                });

                defer.resolve(contacts)
            });
        })
        .catch(function(err){
            defer.reject(new Error(err));
        });
    return defer.promise;
};

function getParticipantsContacts(contacts) {
    var deferred = Q.defer();
    var requestUrl = dataApi.directoryParticipants.url;
    var options = authorizeApiCall(requestUrl);
    var groups = [
        {'enum': 'voting_participants', 'members': []},
        {'enum': 'associate_country_participants', 'members': []},
        {'enum': 'other_associate_participants', 'members': []},
        {'enum': 'gbif_affiliate', 'members': []},
        {'enum': 'former_participants', 'members': []},
        {'enum': 'observer', 'members': []},
        {'enum': 'others', 'members': []}
    ];

    genericEndpointAccess(requestUrl, options)
        .then(function(data){
            // Insert participant details
            var detailsTasks = [];
            data.results.forEach(function(p){
                detailsTasks.push(getParticipantDetails(p));
            });
            return Q.all(detailsTasks);
        })
        .then(function(data){
            // Insert people details
            var contactTasks = [];
            data.forEach(function(p){
                contactTasks.push(getParticipantPeopleDetails(p, contacts));
            });
            return Q.all(contactTasks);
        })
        .then(function(data){

            // Sort participants by name, case insensitive
            const sortedData = _.orderBy(data, [p => p.name.toLowerCase()], ['asc']);

            // group participants according to their participation status.
            sortedData.forEach(function(p){
                if (p.type == 'COUNTRY' && p.participationStatus == 'VOTING') {
                    groups.forEach(function(group){
                        if (group.enum == 'voting_participants') group.members.push(p);
                    });
                }
                else if (p.type == 'COUNTRY' && p.participationStatus == 'ASSOCIATE') {
                    groups.forEach(function(group){
                        if (group.enum == 'associate_country_participants') group.members.push(p);
                    });
                }
                else if (p.type == 'OTHER' && p.participationStatus == 'ASSOCIATE') {
                    groups.forEach(function(group){
                        if (group.enum == 'other_associate_participants') group.members.push(p);
                    });
                }
                else if (p.type == 'OTHER' && p.participationStatus == 'AFFILIATE') {
                    groups.forEach(function(group){
                        if (group.enum == 'gbif_affiliate') group.members.push(p);
                    });
                }
                else if (p.participationStatus == 'FORMER') {
                    groups.forEach(function(group){
                        if (group.enum == 'former_participants') group.members.push(p);
                    });
                }
                else if (p.participationStatus == 'OBSERVER') {
                    groups.forEach(function(group){
                        if (group.enum == 'observer') group.members.push(p);
                    });
                }
                else {
                    groups.forEach(function(group){
                        if (group.enum == 'others') group.members.push(p);
                    });
                }
            });
            return deferred.resolve(groups);
        })
        .catch(function(err){
            deferred.reject(err);
        });

    return deferred.promise;
}

function getParticipantDetails(participant) {
    var deferred = Q.defer();
    var requestUrl = dataApi.directoryParticipant.url + '/' + participant.id;
    var options = authorizeApiCall(requestUrl);

    genericEndpointAccess(requestUrl, options)
        .then(function(data){
            deferred.resolve(data);
        })
        .catch(function(err){
            deferred.reject(new Error(err));
        });
    return deferred.promise;
}

function getParticipantPeopleDetails(participant, contacts) {
    var deferred = Q.defer();
    var peopleTasks = [];
    participant.people.forEach(function(person){
        peopleTasks.push(getPersonContact(person.personId, contacts));
    });
    Q.all(peopleTasks)
        .then(function(peopleDetails){
            // merge original person info about the participant and newly retrieved person details
            participant.people.forEach(function(person, i){
                for (var attr in peopleDetails[i]) {
                    if (!person.hasOwnProperty(attr)) {
                        person[attr] = peopleDetails[i][attr];
                    }
                }
            });
            deferred.resolve(participant);
        })
        .catch(function(err){
            deferred.reject(new Error(err));
        });
    return deferred.promise;
}

function getCommitteeContacts(group, contacts) {
    var deferred = Q.defer();
    var requestUrl = (group == 'gbif_secretariat') ? dataApi.directoryReport.url + '/' + group + '?format=json' : dataApi.directoryCommittee.url + '/' + group;
    var options = authorizeApiCall(requestUrl);

    genericEndpointAccess(requestUrl, options)
        .then(function(results){
            var personsTasks = [];
            results.forEach(function(person){
                personsTasks.push(getPersonContact(person.personId, contacts));
            });
            return Q.all(personsTasks);
        })
        .then(function(committee){
            deferred.resolve(committee);
        })
        .catch(function(err){
            deferred.reject(new Error(err));
        });
    return deferred.promise;
}

function getPersonContact(personId, contacts) {
    var deferred = Q.defer();
    var requestUrl = dataApi.directoryPerson.url + '/' + personId;
    var options = authorizeApiCall(requestUrl);

    genericEndpointAccess(requestUrl, options)
        .then(function(data){
            contacts.people.push(data);
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
    let credential = require('/etc/portal16/credentials.json');

    var appKey = credential.directory.appKey;
    var secret = credential.directory.secret;

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