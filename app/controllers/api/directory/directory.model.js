'use strict';

let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
//    chai = require('chai'),
    querystring = require('querystring'),
    _ = require('lodash'),
    authOperations = require('../../auth/gbifAuthRequest');

module.exports = {
    getCommittee: getCommittee,
    getSecretariat: getSecretariat,
    participantSearch: participantSearch,
    participantPeopleSearch: participantPeopleSearch,
    personSearch: personSearch,
    person: person
};

async function getCommittee(type) {
    return proxyGet(apiConfig.directoryCommittee.url + type);
}

async function getSecretariat() {
    let people = await proxyGet(apiConfig.directorySecretariat.url);
    return people.map(cleanPerson);
}

async function participantSearch(query) {
    let participants = await proxyGet(apiConfig.directoryParticipants.url + '?' + querystring.stringify(query));
    participants.results = participants.results.map(function(p) {
return cleanParticipant(p);
});
    return participants;
}

async function participantPeopleSearch(query) {
    let participants = await proxyGet(apiConfig.directoryParticipant.url + '?' + querystring.stringify(query));
    participants.results = participants.results.map(cleanParticipant);
    let people = [];
    participants.results.forEach(function(p) {
        people = people.concat(flattenParticipantPeople(p));
    });
    people = _.sortBy(people, ['participant', 'roleOrder']);

    return people;
}

async function personSearch(query) {
    let people = await proxyGet(apiConfig.directoryPerson.url + '?' + querystring.stringify(query));
    people.results = people.results.map(cleanPerson);
    return people;
}

async function person(id) {
    let person = await proxyGet(apiConfig.directoryPerson.url + id);
    let personRoles = person.roles || [];
    let personNodes = person.nodes || [];
    let personParticipants = person.participants || [];
    if (personRoles.length == 0 && personNodes.length == 0 && personParticipants.length == 0) {
        throw {statusCode: 404};
    }

    // prune roles
    _.remove(personRoles, function(r) {
        return r.role.startsWith('DIRECTORY') || r.role.endsWith('_SUPPORT');
    });
    _.remove(personNodes, function(r) {
        return r.role.startsWith('DIRECTORY') || r.role.endsWith('_SUPPORT');
    });
    _.remove(personParticipants, function(r) {
        return r.role.startsWith('DIRECTORY') || r.role.endsWith('_SUPPORT');
    });

    // get nodes
    let nodePromises = personNodes.map(function(n) {
        return node(n.nodeId);
    });
    let nodes = await Promise.all(nodePromises);

    // get participants
    let participantIds = personParticipants.map(function(p) {
        return p.participantId;
    });
    participantIds = participantIds.concat(nodes.map(function(n) {
return n.participantId;
}));
    let participantPromises = participantIds.map(function(id) {
        return participant(id);
    });
    let participants = await Promise.all(participantPromises);

    // add node info to person
    nodes = _.keyBy(nodes, 'id');
    participants = _.keyBy(participants, 'id');

    personNodes.forEach(function(n) {
        let node = nodes[n.nodeId];
        n.node = _.pick(node, ['id', 'name', 'participantId']);
        if (_.has(n, 'node.participantId')) {
            let p = participants[_.get(n, 'node.participantId')];
            n.participant = _.pick(p, ['id', 'type', 'participationStatus', 'countryCode', 'name']);
        }
    });

    personParticipants.forEach(function(p) {
        p.participant = _.pick(participants[p.participantId], ['id', 'type', 'participationStatus', 'countryCode', 'name']);
    });
    person.roles = personRoles;
    person.nodes = personNodes;
    person.participants = personParticipants;
    return cleanPerson(person);
}

async function node(id) {
    let node = await proxyGet(apiConfig.directoryNode.url + id);
    return node;
}

async function participant(id) {
    let p = await proxyGet(apiConfig.directoryParticipant.url + id);
    return cleanParticipant(p);
}

async function proxyGet(url) {
    let options = {
        method: 'GET',
        url: url
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

function cleanPerson(p) {
    let pers = _.pick(p,
        ['id', 'firstName', 'surname', 'role', 'roles', 'title', 'jobTitle', 'phone', 'email', 'orcidId', 'areasExpertise', 'languages', 'profileDescriptions', 'certifications', 'address', 'country', 'institutionName', 'countryCode', 'countryName', 'participants', 'nodes']);
    if (pers.address) pers.address = pers.address.replace(/[\r\n]{2,}/g, '\n');
    pers.name = pers.name ? pers.name : pers.firstName + ' ' + pers.surname;
    return pers;
}

function cleanParticipant(p) {
    let res = _.pick(p,
        ['id', 'name', 'type', 'participationStatus', 'participantUrl', 'membershipStart', 'mou2001Date',
         'mou2001Signatory', 'mou2007Date', 'mou2007Signatory', 'mou2012Date', 'mou2012Signatory', 'gbifRegion', 'countryCode', 'people']);
    if (res.people) {
        res.people = res.people.map(function(e) {
            e.person = cleanPerson(e.person);
            return e;
        });
    }
    return res;
}

function flattenParticipantPeople(participant) {
    if (!_.isArray(participant.people)) return [];
    let people = participant.people.map(function(p) {
        p.person.participant_countryCode = participant.countryCode;
        p.person.participant = participant.name;
        p.person.participant_type = participant.type;
        p.person.participant_participationStatus = participant.participationStatus;
        p.person.role = p.role;
        p.person.roleOrder = p.role == 'HEAD_OF_DELEGATION' ? 0 : 1;
        return p.person;
    });
    return people;
}
