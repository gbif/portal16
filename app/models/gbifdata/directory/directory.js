'use strict';

var crypto = require('crypto'),
    _ = require('lodash'),
    Q = require('q'),
    helper = require('../../util/util'),
    fs = require('fs'),
    dataApi = require('../apiConfig'),
    translationsHelper = rootRequire('app/helpers/translations'),
    log = require('../../../../config/log');

var Directory = {};
var calls = 0;
var language;

Directory.getContacts = function (res) {
    var deferFs = Q.defer();
    var defer = Q.defer();
    var groups = [
        'executive_committee',
        'science_committee',
        'budget_committee',
        'nodes_steering_group',
        'nodes_committee'
    ];

    var contacts = {
        'participants': [],
        'committees': [],
        'gbif_secretariat': [],
        'peopleByParticipants': [],
        'people': []
    };

    language = res.locals.gb.locales.current;
    // First check whether we have the credential to complete all the calls to
    // the directory.
    fs.exists('/etc/portal16/credentials.json', deferFs.resolve);

    deferFs.promise
        .then((exists) => {
            if (exists) {
                return Q.all(groups.map(function (group) {
                    return getCommitteeContacts(group, contacts)
                        .then(function (results) {
                            var committee = {
                                'enum': group,
                                'members': results
                            };
                            return committee;
                        })
                        .then(function (committee) {
                            // insert group intro
                            return getGroupIntro(committee)
                                .then(function (committee) {
                                    return committee;
                                });
                        })
                        .then(function (committee) {
                            return contacts.committees.push(committee);
                        });
                }))
            }
            else {
                throw new Error('No credential available.');
            }
        })
        .then(function () {
            return getParticipantsContacts(contacts).then(function (groupedP) {
                contacts.participants = groupedP;

                // Make sure the country code comes from Participant entity
                var participantPeople = [];
                groupedP.forEach(function (p) {
                    var memberObj = {
                        'enum': p.enum,
                        'people': []
                    };
                    p.members.forEach(function (member) {
                        member.people.forEach(function (person) {
                            if (member.hasOwnProperty('countryCode')) person.participantCountry = member.countryCode;
                            if (member.hasOwnProperty('countryCode') && !person.hasOwnProperty('countryCode')) {
                                person.countryCode = member.countryCode;
                            }
                            person.participantName = member.name;
                            memberObj.people.push(person);
                        });
                    });
                    memberObj.people = _.orderBy(memberObj.people, [person => person.countryCode, person => person.role, person => person.firstName], ['asc', 'desc', 'asc']);
                    participantPeople.push(memberObj);
                });
                contacts.peopleByParticipants = participantPeople;

                // For filtering
                // 1) de-duplication
                contacts.people = _.uniqBy(contacts.people, 'id');
                contacts.people = _.orderBy(contacts.people, [person => person.surname.toLowerCase(), ['asc']]);

                // 2) strip people details
                contacts.people.forEach(function (p, i) {
                    var strippedP = {};
                    strippedP.name = p.firstName + ' ' + p.surname;
                    contacts.people[i] = strippedP;
                });

                contacts = processContacts(contacts);
                return contacts;
            });
        })
        .then(function (contacts) {
            // get gbif_secretariat contacts
            return getCommitteeContacts('gbif_secretariat', contacts)
                .then(function (members) {
                    var obj = {
                        'enum': 'gbif_secretariat',
                        'members': members
                    };
                    return getGroupIntro(obj);
                })
                .then(function (group) {
                    contacts.gbif_secretariat.push(group);
                    return contacts;
                });
        })
        .then(function (contacts) {
            defer.resolve(contacts);
            log.info(calls + ' calls have been made to complete the contacts page.');
        })
        .catch(function (err) {
            defer.reject(new Error(err));
        });
    return defer.promise;
};

Directory.postProcessContacts = function (contacts, __) {
    // process data
    contacts.peopleByParticipants.forEach(function (p) {
        p.people.forEach(function (person) {
            // insert countryName if missing
            if (!person.hasOwnProperty('countryName')) person.countryName = __('country.' + person.participantCountry);
            // insert role name
            if (person.hasOwnProperty('roles')) {
                person.roles.forEach(function (role) {
                    role.translatedLabel = __('role.' + role.role);
                });
            }
        });
    });
    contacts.committees.forEach(function (committee) {
        committee.members.forEach(function (member) {
            member.roles.forEach(function (role) {
                role.translatedLabel = __('role.' + role.role);
            });
        });
    });
};

function processContacts(contacts) {

    // sort committees
    var committeeOrder = ['executive_committee', 'science_committee', 'budget_committee', 'nodes_steering_group', 'nodes_committee', 'gbif_secretariat'];
    contacts.committees.sort(function (x, y) {
        return committeeOrder.indexOf(x.enum) - committeeOrder.indexOf(y.enum);
    });

    var committeeRoles = {
        'executive_committee': [
            'GOVERNING_BOARD_CHAIR',
            'GOVERNING_BOARD_1ST_VICE_CHAIR',
            'GOVERNING_BOARD_2ND_VICE_CHAIR',
            'GOVERNING_BOARD_3RD_VICE_CHAIR',
            'SCIENCE_COMMITTEE_CHAIR',
            'BUDGET_COMMITTEE_CHAIR',
            'NODES_COMMITTEE_CHAIR',
            'EXECUTIVE_SECRETARY',
            'EXECUTIVE_COMMITTEE_GBIFS_SUPPORT'
        ],
        'science_committee': [
            'SCIENCE_COMMITTEE_CHAIR',
            'SCIENCE_COMMITTEE_1ST_VICE_CHAIR',
            'SCIENCE_COMMITTEE_2ND_VICE_CHAIR',
            'SCIENCE_COMMITTEE_3RD_VICE_CHAIR',
            'SCIENCE_COMMITTEE_MEMBER',
            'GOVERNING_BOARD_CHAIR',
            'EXECUTIVE_SECRETARY',
            'SCIENCE_COMMITTEE_GBIFS_SUPPORT'
        ],
        'budget_committee': [
            'BUDGET_COMMITTEE_CHAIR',
            'BUDGET_COMMITTEE_1ST_VICE_CHAIR',
            'BUDGET_COMMITTEE_2ND_VICE_CHAIR',
            'BUDGET_COMMITTEE_MEMBER',
            'GOVERNING_BOARD_CHAIR',
            'EXECUTIVE_SECRETARY',
            'BUDGET_COMMITTEE_GBIFS_SUPPORT'
        ],
        'nodes_steering_group': [
            'NODES_COMMITTEE_CHAIR',
            'NODES_COMMITTEE_1ST_VICE_CHAIR',
            'NODES_COMMITTEE_2ND_VICE_CHAIR',
            'NODES_REGIONAL_REPRESENTATIVE_AFRICA',
            'NODES_REGIONAL_REPRESENTATIVE_DEPUTY_AFRICA',
            'NODES_REGIONAL_REPRESENTATIVE_ASIA',
            'NODES_REGIONAL_REPRESENTATIVE_DEPUTY_ASIA',
            'NODES_REGIONAL_REPRESENTATIVE_EUROPE',
            'NODES_REGIONAL_REPRESENTATIVE_DEPUTY_EUROPE',
            'NODES_REGIONAL_REPRESENTATIVE_LATIN_AMERICA',
            'NODES_REGIONAL_REPRESENTATIVE_DEPUTY_LATIN_AMERICA',
            'NODES_REGIONAL_REPRESENTATIVE_NORTH_AMERICA',
            'NODES_REGIONAL_REPRESENTATIVE_DEPUTY_NORTH_AMERICA',
            'NODES_REGIONAL_REPRESENTATIVE_OCEANIA',
            'NODES_REGIONAL_REPRESENTATIVE_DEPUTY_OCEANIA',
            'NODES_COMMITTEE_GBIFS_SUPPORT'
        ],
        'nodes_committee': [
            'NODES_COMMITTEE_CHAIR',
            'NODES_COMMITTEE_1ST_VICE_CHAIR',
            'NODES_COMMITTEE_2ND_VICE_CHAIR',
            'NODES_REGIONAL_REPRESENTATIVE_AFRICA',
            'NODES_REGIONAL_REPRESENTATIVE_DEPUTY_AFRICA',
            'NODES_REGIONAL_REPRESENTATIVE_ASIA',
            'NODES_REGIONAL_REPRESENTATIVE_DEPUTY_ASIA',
            'NODES_REGIONAL_REPRESENTATIVE_EUROPE',
            'NODES_REGIONAL_REPRESENTATIVE_DEPUTY_EUROPE',
            'NODES_REGIONAL_REPRESENTATIVE_LATIN_AMERICA',
            'NODES_REGIONAL_REPRESENTATIVE_DEPUTY_LATIN_AMERICA',
            'NODES_REGIONAL_REPRESENTATIVE_NORTH_AMERICA',
            'NODES_REGIONAL_REPRESENTATIVE_DEPUTY_NORTH_AMERICA',
            'NODES_REGIONAL_REPRESENTATIVE_OCEANIA',
            'NODES_REGIONAL_REPRESENTATIVE_DEPUTY_OCEANIA',
            'NODES_COMMITTEE_GBIFS_SUPPORT'
        ],
        'gbifs_secretariat': [
            'GBIFS_STAFF_MEMBER'
        ]
    };

    // committee specific processing
    contacts.committees.forEach(function (committee) {
        // reduce roles to one according to committee
        committee.members.forEach(function (member) {
            if (member.roles.length > 1) {
                member.roles = member.roles.filter(function (role) {
                    if (committee.enum != 'gbif_secretariat') return committeeRoles[committee.enum].indexOf(role.role) != -1;
                });
            }
        });

        if (committee.enum == 'nodes_committee') {
            committee.members.forEach(function (member) {
                if (member.nodes.length > 0) {
                    member.nodes.forEach(function (node) {
                        if (node.role == 'NODE_MANAGER') {
                            member.membershipType = node.membershipType;
                        }
                    });
                }
            });
        }

        // Sort by defined order as committeeRoles above.
        if (committee.enum == 'nodes_steering_group') {
            var nsgRoles = committeeRoles[committee.enum];
            committee.members = committee.members.sort(function (a, b) {
                return nsgRoles.indexOf(a.roles[0].role) - nsgRoles.indexOf(b.roles[0].role)
            });
        }

    });

    // sort peopleByParticipants by participant name
    contacts.peopleByParticipants.forEach(function (pGroup) {
        pGroup.people = _.orderBy(pGroup.people, [p => p.participantName.toLowerCase()], ['asc']);
    });
    return contacts;
}

function getGroupIntro(group) {
    var deferred = Q.defer();
    // insert intro text for each group.
    let groupIntroFile = ['directory/contactUs/' + group.enum + '/'];
    translationsHelper.getTranslationPromise(groupIntroFile, language)
        .then(function (translation) {
            group.intro = translation[0];
            deferred.resolve(group);
        })
        .catch(function (err) {
            deferred.reject(err.message + ' in getGroupIntro()');
        });
    return deferred.promise;
}

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

    helper.getApiDataPromise(requestUrl, options)
        .then(function (data) {
            // Insert participant details
            var detailsTasks = [];
            data.results.forEach(function (p) {
                detailsTasks.push(getParticipantDetails(p.id));
            });
            return Q.all(detailsTasks);
        })
        .then(function (data) {
            // Insert people details
            var contactTasks = [];
            data.forEach(function (p) {
                contactTasks.push(getParticipantPeopleDetails(p, contacts));
            });
            return Q.all(contactTasks);
        })
        .then(function (data) {

            // Sort participants by name, case insensitive
            const sortedData = _.orderBy(data, [p => p.name.toLowerCase()], ['asc']);

            // group participants according to their participation status.
            sortedData.forEach(function (p) {
                if (p.type == 'COUNTRY' && p.participationStatus == 'VOTING') {
                    groups.forEach(function (group) {
                        if (group.enum == 'voting_participants') group.members.push(p);
                    });
                }
                else if (p.type == 'COUNTRY' && p.participationStatus == 'ASSOCIATE') {
                    groups.forEach(function (group) {
                        if (group.enum == 'associate_country_participants') group.members.push(p);
                    });
                }
                else if (p.type == 'OTHER' && p.participationStatus == 'ASSOCIATE') {
                    groups.forEach(function (group) {
                        if (group.enum == 'other_associate_participants') group.members.push(p);
                    });
                }
                else if (p.type == 'OTHER' && p.participationStatus == 'AFFILIATE') {
                    groups.forEach(function (group) {
                        if (group.enum == 'gbif_affiliate') group.members.push(p);
                    });
                }
                else if (p.participationStatus == 'FORMER') {
                    groups.forEach(function (group) {
                        if (group.enum == 'former_participants') group.members.push(p);
                    });
                }
                else if (p.participationStatus == 'OBSERVER') {
                    groups.forEach(function (group) {
                        if (group.enum == 'observer') group.members.push(p);
                    });
                }
                else {
                    groups.forEach(function (group) {
                        if (group.enum == 'others') group.members.push(p);
                    });
                }
            });

            var translationTasks = [];
            groups.forEach(function (group) {
                translationTasks.push(getGroupIntro(group));
            });
            return Q.all(translationTasks)
                .then(function (groups) {
                    return groups;
                });
        })
        .then(function (groups) {
            deferred.resolve(groups);
        })
        .catch(function (err) {
            deferred.reject(err + 'line 403.');
        });

    return deferred.promise;
}

function getParticipantDetails(participantId) {
    var deferred = Q.defer();
    var requestUrl = dataApi.directoryParticipant.url + '/' + participantId;
    var options = authorizeApiCall(requestUrl);

    helper.getApiDataPromise(requestUrl, options)
        .then(function (data) {
            deferred.resolve(data);
        })
        .catch(function (err) {
            deferred.reject(err + ' in getParticipantDetails()');
            log.info(err + ' in getParticipantDetails()');
        });
    return deferred.promise;
}

function getNodeDetails(nodeId) {
    var deferred = Q.defer();
    var requestUrl = dataApi.directoryNode.url + '/' + nodeId;
    var options = authorizeApiCall(requestUrl);

    helper.getApiDataPromise(requestUrl, options)
        .then(function (data) {
            return getParticipantDetails(data.participantId)
                .then(function (result) {
                    data.participantName = result.name;
                    setMembership(result);
                    data.membershipType = result.membershipType;
                    return data;
                });
        })
        .then(function (data) {
            deferred.resolve(data);
        })
        .catch(function (err) {
            deferred.reject(new Error(err + ' in getNodeDetails()'));
            log.info(err + ' in getNodeDetails()');
        });
    return deferred.promise;
}

function getParticipantPeopleDetails(participant, contacts) {
    var deferred = Q.defer();
    var peopleTasks = [];
    participant.people.forEach(function (person) {
        peopleTasks.push(getPersonContact(person.personId, contacts));
    });
    Q.all(peopleTasks)
        .then(function (peopleDetails) {
            // merge original person info about the participant and newly retrieved person details
            participant.people.forEach(function (person, i) {
                for (var attr in peopleDetails[i]) {
                    if (!person.hasOwnProperty(attr)) {
                        person[attr] = peopleDetails[i][attr];
                    }
                }
            });
            deferred.resolve(participant);
        })
        .catch(function (err) {
            deferred.reject(new Error(err + ' in getParticipantPeopleDetails()'));
            log.info(err + ' in getParticipantPeopleDetails()');
        });
    return deferred.promise;
}

function getCommitteeContacts(group, contacts) {
    var deferred = Q.defer();
    var requestUrl = (group == 'gbif_secretariat') ? dataApi.directoryReport.url + '/' + group + '?format=json' : dataApi.directoryCommittee.url + '/' + group;
    var options = authorizeApiCall(requestUrl);

    helper.getApiDataPromise(requestUrl, options)
        .then(function (results) {
            var personsTasks = [];
            results.forEach(function (person) {
                if (group == 'gbif_secretariat') {
                    personsTasks.push(getPersonContact(person.id, contacts));
                }
                else {
                    personsTasks.push(getPersonContact(person.personId, contacts));
                }
            });
            return Q.all(personsTasks);
        })
        .then(function (committee) {
            // determine the role to show
            committee.forEach(function (member) {
                if (!member.hasOwnProperty('participantName')) {
                    if (member.participants.length > 0) {
                        member.participantName = member.participants[0].participantName;
                    }
                }
                if (group == 'nodes_committee') {
                    if (!member.hasOwnProperty('roles')) {
                        member.roles = [];
                    }
                    if (member.nodes.length > 0) {
                        member.nodes.forEach(function (node) {
                            member.roles.push({'nodeId': node.nodeId, 'role': node.role});
                        });
                    }
                    // if member is from Nodes Committee, get their participant name from Node object.
                    if (member.nodes.length > 0) {
                        member.nodes.forEach(function (node) {
                            if (node.role == 'NODE_MANAGER') {
                                member.participantName = node.participantName;
                            }
                        });
                    }
                }
            });
            deferred.resolve(committee);
        })
        .catch(function (err) {
            deferred.reject(new Error(err + ' in getCommitteeContacts() while accessing ' + requestUrl));
            log.info(err + ' in getCommitteeContacts() while accessing ' + requestUrl);
        });
    return deferred.promise;
}

function getPersonContact(personId, contacts) {
    var deferred = Q.defer();
    var requestUrl = dataApi.directoryPerson.url + '/' + personId;
    var options = authorizeApiCall(requestUrl);

    helper.getApiDataPromise(requestUrl, options)
        .then(function (data) {
            // get node name and/or participant name
            var participantTasks = [];
            if (data.hasOwnProperty('participants') && data.participants.length > 0) {
                data.participants.forEach(function (p) {
                    if (p.hasOwnProperty('participantId')) {
                        participantTasks.push(getParticipantDetails(p.participantId));
                    }
                });
                return Q.all(participantTasks).then(function (results) {
                    results.forEach(function (result, i) {
                        data.participants[i].participantName = result.name;
                        // merge properties
                        for (var attr in result) {
                            if (!data.participants[i].hasOwnProperty(attr)) {
                                data.participants[i][attr] = result[attr];
                            }
                        }
                    });
                    data.participants.forEach(function (p) {
                        setMembership(p);
                    });
                    return data;
                });
            }
            else {
                return data;
            }
        })
        .then(function (data) {
            var nodeTasks = [];
            if (data.hasOwnProperty('nodes') && data.nodes.length > 0) {
                data.nodes.forEach(function (n) {
                    if (n.hasOwnProperty('nodeId')) {
                        nodeTasks.push(getNodeDetails(n.nodeId));
                    }
                });
            }
            return Q.all(nodeTasks).then(function (results) {
                results.forEach(function (result, i) {
                    for (var attr in result) {
                        if (!data.nodes[i].hasOwnProperty(attr)) {
                            data.nodes[i][attr] = result[attr];
                        }
                    }
                });
                return data;
            });
        })
        .then(function (data) {
            contacts.people.push(data);
            deferred.resolve(data);
        })
        .catch(function (err) {
            deferred.reject(new Error(err + ' in getPersonContact() while accessing ' + requestUrl));
            log.info(err + ' in getPersonContact() while accessing ' + requestUrl);
        });
    return deferred.promise;
}

function setMembership(p) {
    // determine membership type
    if (p.type == 'COUNTRY' && p.participationStatus == 'VOTING') {
        p.membershipType = 'voting_participant';
    }
    else if (p.type == 'COUNTRY' && p.participationStatus == 'ASSOCIATE') {
        p.membershipType = 'associate_country_participant';
    }
    else if (p.type == 'OTHER' && p.participationStatus == 'ASSOCIATE') {
        p.membershipType = 'other_associate_participant';
    }
    else if (p.type == 'OTHER' && p.participationStatus == 'AFFILIATE') {
        p.membershipType = 'gbif_affiliate';
    }
    else if (p.participationStatus == 'FORMER') {
        p.membershipType = 'former_participant';
    }
    else if (p.participationStatus == 'OBSERVER') {
        p.membershipType = 'observer';
    }
    else {
        p.membershipType = 'not_specified';
    }
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