'use strict';

let crypto = require('crypto'),
    _ = require('lodash'),
    Q = require('q'),
    helper = require('../../util/util'),
    fs = require('fs'),
    dataApi = require('../apiConfig'),
    translationsHelper = rootRequire('app/helpers/translations'),
    log = require('../../../../config/log');

let Directory = {};
let language;

Directory.checkCredentials = () => {
    let deferred = Q.defer();
    // First check whether we have the credential to complete all the calls to
    // the directory.
    fs.exists('/etc/portal16/credentials.json', deferred.resolve);
    return deferred.promise;
};

Directory.getContacts = function(res) {
   return Directory.retrieveContacts(res)
        .catch((e) => {
            log.error(e);
        });
};

Directory.retrieveContacts = (res) => {
    language = res.locals.gb.locales.current;
    let groups = [
        'executive_committee',
        'science_committee',
        'budget_committee',
        'nodes_steering_group',
        'nodes_committee'
    ];

    let contacts = {
        'participants': [],
        'committees': [],
        'gbif_secretariat': [],
        'peopleByParticipants': [],
        'people': []
    };

 return Directory.checkCredentials()
        .then((exists) => {
            if (exists) {
                return Q.all(groups.map(function(group) {
                    return Directory.getCommitteeContacts(group, contacts)
                        .then(function(results) {
                            let committee = {
                                'enum': group,
                                'members': results
                            };
                            return committee;
                        })
                        .then(function(committee) {
                            // insert group intro
                            return getGroupIntro(committee)
                                .then(function(committee) {
                                    return committee;
                                });
                        })
                        .then(function(committee) {
                            return contacts.committees.push(committee);
                        });
                }));
            } else {
                throw new Error('No credential available.');
            }
        })
        .then(function() {
            return getParticipantsContacts(contacts).then(function(groupedP) {
                contacts.participants = groupedP;

                // Make sure the country code comes from Participant entity
                let participantPeople = [];
                groupedP.forEach(function(p) {
                    let memberObj = {
                        'enum': p.enum,
                        'people': []
                    };
                    p.members.forEach(function(member) {
                        member.people.forEach(function(person) {
                            if (member.hasOwnProperty('countryCode')) person.participantCountry = member.countryCode;
                            if (member.hasOwnProperty('countryCode') && !person.hasOwnProperty('countryCode')) {
                                person.countryCode = member.countryCode;
                            }
                            person.participantName = member.name;
                            memberObj.people.push(person);
                        });
                    });
                    memberObj.people = _.orderBy(memberObj.people, [(person) => person.countryCode, (person) => person.role, (person) => person.firstName], ['asc', 'desc', 'asc']);
                    participantPeople.push(memberObj);
                });
                contacts.peopleByParticipants = participantPeople;

                // For filtering
                // 1) de-duplication
                contacts.people = _.uniqBy(contacts.people, 'id');
                contacts.people = _.orderBy(contacts.people, [(person) => person.surname.toLowerCase(), ['asc']]);

                // 2) strip people details
                contacts.people.forEach(function(p, i) {
                    let strippedP = {};
                    strippedP.name = p.firstName + ' ' + p.surname;
                    contacts.people[i] = strippedP;
                });

                contacts = processContacts(contacts);
                return contacts;
            });
        })
        .then(function(contacts) {
            // get gbif_secretariat contacts
            return Directory.getCommitteeContacts('gbif_secretariat', contacts)
                .then(function(members) {
                    let obj = {
                        'enum': 'gbif_secretariat',
                        'members': members
                    };
                    return getGroupIntro(obj);
                })
                .then(function(group) {
                    contacts.gbif_secretariat.push(group);
                    return contacts;
                });
        })
        .catch(function(err) {
            log.error(err);
        });
};

Directory.applyTranslation = function(contacts, __) {
    // apply translation
    if (contacts.hasOwnProperty('peopleByParticipants')) {
        contacts.peopleByParticipants.forEach(function(p) {
            p.people.forEach(function(person) {
                // insert countryName if missing
                if (!person.hasOwnProperty('countryName')) person.countryName = __('country.' + person.participantCountry);
                // insert role name
                if (person.hasOwnProperty('roles')) {
                    person.roles.forEach(function(role) {
                        role.translatedLabel = __('gbifRole.' + role.role);
                    });
                }
            });
        });
    }
    if (contacts.hasOwnProperty('committees')) {
        contacts.committees.forEach(function(committee) {
            committee.members.forEach(function(member) {
                member.roles.forEach(function(role) {
                    role.translatedLabel = __('gbifRole.' + role.role);
                });
            });
        });
    }
};

function processContacts(contacts) {
    // sort committees
    let committeeOrder = ['executive_committee', 'science_committee', 'budget_committee', 'nodes_steering_group', 'nodes_committee', 'gbif_secretariat'];
    contacts.committees.sort(function(x, y) {
        return committeeOrder.indexOf(x.enum) - committeeOrder.indexOf(y.enum);
    });

    let committeeRoles = {
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
    contacts.committees.forEach(function(committee) {
        // reduce roles to one according to committee
        committee.members.forEach(function(member) {
            if (member.roles.length > 1) {
                member.roles = member.roles.filter(function(role) {
                    if (committee.enum != 'gbif_secretariat') return committeeRoles[committee.enum].indexOf(role.role) != -1;
                });
            }
        });

        if (committee.enum == 'nodes_committee') {
            committee.members.forEach(function(member) {
                if (member.nodes.length > 0) {
                    member.nodes.forEach(function(node) {
                        if (node.role == 'NODE_MANAGER') {
                            member.membershipType = node.membershipType;
                        }
                    });
                }
            });
        }

        // Sort by defined order as committeeRoles above.
        if (committee.enum == 'nodes_steering_group') {
            let nsgRoles = committeeRoles[committee.enum];
            committee.members = committee.members.sort(function(a, b) {
                return nsgRoles.indexOf(a.roles[0].role) - nsgRoles.indexOf(b.roles[0].role);
            });
        }
    });

    // sort peopleByParticipants by participant name
    contacts.peopleByParticipants.forEach(function(pGroup) {
        pGroup.people = _.orderBy(pGroup.people, [(p) => p.participantName.toLowerCase()], ['asc']);
    });
    return contacts;
}

function getGroupIntro(group) {
    // insert intro text for each group.
    let groupIntroFile = ['directory/contactUs/' + group.enum + '/'];
   return translationsHelper.getTranslationPromise(groupIntroFile, language)
        .then(function(translation) {
            group.intro = translation[0];
            return group;
        })
        .catch(function(err) {
            log.error(err);
        });
}

function getParticipantsContacts(contacts) {
    let requestUrl = dataApi.directoryParticipants.url;
    let options = Directory.authorizeApiCall(requestUrl);
    let groups = [
        {'enum': 'voting_participant', 'members': []},
        {'enum': 'associate_country_participant', 'members': []},
        {'enum': 'other_associate_participant', 'members': []},
        {'enum': 'gbif_affiliate', 'members': []},
        {'enum': 'former_participant', 'members': []},
        {'enum': 'observer', 'members': []},
        {'enum': 'others', 'members': []}
    ];

   return helper.getApiDataPromise(requestUrl, options)
        .then(function(data) {
            // Insert participant details
            let detailsTasks = [];
            data.results.forEach(function(p) {
                detailsTasks.push(getParticipantDetails(p.id));
            });
            return Q.all(detailsTasks);
        })
        .then(function(data) {
            // Insert people details
            let contactTasks = [];
            data.forEach(function(p) {
                contactTasks.push(getParticipantPeopleDetails(p, contacts));
            });
            return Q.all(contactTasks);
        })
        .then(function(data) {
            // Sort participants by name, case insensitive
            const sortedData = _.orderBy(data, [(p) => p.name.toLowerCase()], ['asc']);

            // group participants according to their participation status.
            sortedData.forEach(function(p) {
                if (p.type == 'COUNTRY' && p.participationStatus == 'VOTING') {
                    groups.forEach(function(group) {
                        if (group.enum == 'voting_participant') group.members.push(p);
                    });
                } else if (p.type == 'COUNTRY' && p.participationStatus == 'ASSOCIATE') {
                    groups.forEach(function(group) {
                        if (group.enum == 'associate_country_participant') group.members.push(p);
                    });
                } else if (p.type == 'OTHER' && p.participationStatus == 'ASSOCIATE') {
                    groups.forEach(function(group) {
                        if (group.enum == 'other_associate_participant') group.members.push(p);
                    });
                } else if (p.type == 'OTHER' && p.participationStatus == 'AFFILIATE') {
                    groups.forEach(function(group) {
                        if (group.enum == 'gbif_affiliate') group.members.push(p);
                    });
                } else if (p.participationStatus == 'FORMER') {
                    groups.forEach(function(group) {
                        if (group.enum == 'former_participant') group.members.push(p);
                    });
                } else if (p.participationStatus == 'OBSERVER') {
                    groups.forEach(function(group) {
                        if (group.enum == 'observer') group.members.push(p);
                    });
                } else {
                    groups.forEach(function(group) {
                        if (group.enum == 'others') group.members.push(p);
                    });
                }
            });

            let translationTasks = [];
            groups.forEach(function(group) {
                translationTasks.push(getGroupIntro(group));
            });
            return Q.all(translationTasks);
        })
        .catch(function(err) {
            log.error(err);
        });
}

function getParticipantDetails(participantId) {
    let requestUrl = dataApi.directoryParticipant.url + participantId;
    let options = Directory.authorizeApiCall(requestUrl);

  return helper.getApiDataPromise(requestUrl, options)
        .catch(function(err) {
            log.info(err + ' in getParticipantDetails()');
        });
}

function getNodeDetails(nodeId) {
    let requestUrl = dataApi.directoryNode.url + nodeId;
    let options = Directory.authorizeApiCall(requestUrl);

   return helper.getApiDataPromise(requestUrl, options)
        .then(function(data) {
            return getParticipantDetails(data.participantId)
                .then(function(result) {
                    data.participantName = result.name;
                    Directory.setMembership(result);
                    data.membershipType = result.membershipType;
                    return data;
                });
        })
        .catch(function(err) {
            log.info(err + ' in getNodeDetails()');
        });
}

function getParticipantPeopleDetails(participant, contacts) {
    let peopleTasks = [];
    participant.people.forEach(function(person) {
        peopleTasks.push(getPersonContact(person.personId, contacts));
    });
   return Q.all(peopleTasks)
        .then(function(peopleDetails) {
            // merge original person info about the participant and newly retrieved person details
            participant.people.forEach(function(person, i) {
                for (let attr in peopleDetails[i]) {
                    if (!person.hasOwnProperty(attr)) {
                        person[attr] = peopleDetails[i][attr];
                    }
                }
            });
            return participant;
        })
        .catch(function(err) {
            log.info(err + ' in getParticipantPeopleDetails()');
        });
}

Directory.getCommitteeContacts = (group, contacts) => {
    let requestUrl = (group == 'gbif_secretariat') ? dataApi.directoryReport.url + group + '?format=json' : dataApi.directoryCommittee.url + group;
    let options = Directory.authorizeApiCall(requestUrl);

   return helper.getApiDataPromise(requestUrl, options)
        .then(function(results) {
            let personsTasks = [];
            results.forEach(function(person) {
                if (group == 'gbif_secretariat') {
                    personsTasks.push(getPersonContact(person.id, contacts));
                } else {
                    personsTasks.push(getPersonContact(person.personId, contacts));
                }
            });
            return Q.all(personsTasks);
        })
        .then(function(committee) {
            // determine the role to show
            committee.forEach(function(member) {
                if (!member.hasOwnProperty('participantName')) {
                    if (member.participants && member.participants.length > 0) {
                        member.participantName = member.participants[0].participantName;
                    }
                }
                if (group == 'nodes_committee') {
                    if (!member.hasOwnProperty('roles')) {
                        member.roles = [];
                    }
                    if (member.nodes && member.nodes.length > 0) {
                        member.nodes.forEach(function(node) {
                            member.roles.push({'nodeId': node.nodeId, 'role': node.role});
                        });
                    }
                    // if member is from Nodes Committee, get their participant name from Node object.
                    if (member.nodes && member.nodes.length > 0) {
                        member.nodes.forEach(function(node) {
                            if (node.role == 'NODE_MANAGER') {
                                member.participantName = node.participantName;
                            }
                        });
                    }
                }
            });
            return committee;
        })
        .catch(function(err) {
            log.info(err + ' in getCommitteeContacts() while accessing ' + requestUrl);
        });
};

function getPersonContact(personId, contacts) {
    let requestUrl = dataApi.directoryPerson.url + personId;
    let options = Directory.authorizeApiCall(requestUrl);

    return helper.getApiDataPromise(requestUrl, options)
        .then(function(data) {
            // get node name and/or participant name
            let participantTasks = [];
            if (data.hasOwnProperty('participants') && data.participants.length > 0) {
                data.participants.forEach(function(p) {
                    if (p.hasOwnProperty('participantId')) {
                        participantTasks.push(getParticipantDetails(p.participantId));
                    }
                });
                return Q.all(participantTasks).then(function(results) {
                    results.forEach(function(result, i) {
                        data.participants[i].participantName = result.name;
                        // merge properties
                        for (let attr in result) {
                            if (!data.participants[i].hasOwnProperty(attr)) {
                                data.participants[i][attr] = result[attr];
                            }
                        }
                    });
                    data.participants.forEach(function(p) {
                        Directory.setMembership(p);
                    });
                    return data;
                });
            } else {
                return data;
            }
        })
        .then(function(data) {
            let nodeTasks = [];
            if (data.hasOwnProperty('nodes') && data.nodes.length > 0) {
                data.nodes.forEach(function(n) {
                    if (n.hasOwnProperty('nodeId')) {
                        nodeTasks.push(getNodeDetails(n.nodeId));
                    }
                });
            }
            return Q.all(nodeTasks).then(function(results) {
                results.forEach(function(result, i) {
                    for (let attr in result) {
                        if (!data.nodes[i].hasOwnProperty(attr)) {
                            data.nodes[i][attr] = result[attr];
                        }
                    }
                });
                return data;
            });
        })
        .then(function(data) {
            contacts.people.push(data);
            return data;
        })
        .catch(function(err) {
            log.info(err + ' in getPersonContact() while accessing ' + requestUrl);
        });
}

Directory.getPersonDetail = (personId) => {
    let requestUrl = dataApi.directoryPerson.url + personId;
    let options = Directory.authorizeApiCall(requestUrl);

    return helper.getApiDataPromise(requestUrl, options)
        .catch((e) => {
            let reason = e + ' in getPersonDetail().';
            log.info(reason);
        });
};

Directory.getParticipantHeads = (pid) => {
    let heads = {},
        pDetail = {};

   return getParticipantDetails(pid)
        .then((participant) => {
            pDetail.id = participant.id;
            pDetail.name = participant.name;
            pDetail.type = participant.type;
            pDetail.participationStatus = participant.participationStatus;
            pDetail.participantUrl = participant.participantUrl;
            pDetail.membershipStart = participant.membershipStart;
            pDetail.gbifRegion = participant.gbifRegion;
            pDetail.countryCode = participant.countryCode;
            Directory.setMembership(pDetail);

            if (participant.hasOwnProperty('people') && participant.people.length > 0) {
                let hod = participant.people.filter((person) => {
                    return person.role === 'HEAD_OF_DELEGATION';
                });
                if (hod.length > 0) {
                    heads.HEAD_OF_DELEGATION = hod[0];
                }
            }
            if (participant.hasOwnProperty('nodes') && participant.nodes.length > 0) {
                return getNodeDetails(participant.nodes[0].id);
            } else {
                return null;
            }
        })
        .then((node) => {
            if (node !== null && node.hasOwnProperty('people') && node.people.length > 0) {
                let nm = node.people.filter((person) => {
                    return person.role === 'NODE_MANAGER';
                });
                if (nm.length > 0) {
                    heads.NODE_MANAGER = nm[0];
                }
            }
            let tasks = [];
            Object.keys(heads).forEach((role) => {
                tasks.push(Directory.getPersonDetail(heads[role].personId)
                    .then((person) => {
                        heads[role] = person;
                    }));
            });
            return Q.all(tasks)
                .then(() => {
                    heads.participantInfo = pDetail;
                    return heads;
                });
        })
        .catch((e) => {
            let reason = e + ' in getParticipantHeads().';
            log.info(reason);
        });
};

Directory.setMembership = (p) => {
    // determine membership type
    if (p.type == 'COUNTRY' && p.participationStatus == 'VOTING') {
        p.membershipType = 'voting_participant';
    } else if (p.type == 'COUNTRY' && p.participationStatus == 'ASSOCIATE') {
        p.membershipType = 'associate_country_participant';
    } else if (p.type == 'OTHER' && p.participationStatus == 'ASSOCIATE') {
        p.membershipType = 'other_associate_participant';
    } else if (p.type == 'OTHER' && p.participationStatus == 'AFFILIATE') {
        p.membershipType = 'gbif_affiliate';
    } else if (p.participationStatus == 'FORMER') {
        p.membershipType = 'former_participant';
    } else if (p.participationStatus == 'OBSERVER') {
        p.membershipType = 'observer';
    } else {
        p.membershipType = 'not_specified';
    }
};

Directory.authorizeApiCall = (requestUrl) => {
    let credential = require('/etc/portal16/credentials.json');

    let appKey = credential.directory.appKey;
    let secret = credential.directory.secret;

    let options = {
        url: requestUrl,
        retries: 5,
        method: 'GET',
        headers: {
            'x-gbif-user': appKey,
            'x-url': requestUrl
        }
    };

    let stringToSign = options.method + '\n' + requestUrl + '\n' + appKey;
    let signature = crypto.createHmac('sha1', secret).update(stringToSign).digest('base64');
    options.headers.Authorization = 'GBIF' + ' ' + appKey + ':' + signature;
    return options;
};

module.exports = Directory;
