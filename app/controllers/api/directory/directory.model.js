'use strict';

let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    chai = require('chai'),
    expect = chai.expect,
    querystring = require('querystring'),
    request = require('requestretry'),
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
    //return proxyGet(apiConfig.directoryCommittee.url + type);
    return proxyGet('https://api.gbif-dev.org/v1/directory/committee/' + type);
}

async function getSecretariat() {
    return proxyGet(apiConfig.directorySecretariat.url);
}

async function participantSearch(query) {
    //let participants = await proxyGet(apiConfig.directoryParticipant.url + '?' + querystring.stringify(query));
    let participants = await proxyGet('https://api.gbif-dev.org/v1/directory/participant?' + querystring.stringify(query));
    participants.results = participants.results.map(cleanParticipant);
    return participants;
}

async function participantPeopleSearch(query) {
    //let participants = await proxyGet(apiConfig.directoryParticipant.url + '?' + querystring.stringify(query));
    let participants = await proxyGet('https://api.gbif-dev.org/v1/directory/participant?' + querystring.stringify(query));
    participants.results = participants.results.map(cleanParticipant);
    let people = [];
    participants.results.forEach(function(p){
        people = people.concat(flattenParticipantPeople(p));
    });
    people = _.sortBy(people, ['participant_country', 'roleOrder']);
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

    //prune roles
    _.remove(personRoles, function(r) {
        return r.role.startsWith('DIRECTORY') || r.role.endsWith('_SUPPORT');
    });
    _.remove(personNodes, function(r) {
        return r.role.startsWith('DIRECTORY') || r.role.endsWith('_SUPPORT');
    });
    _.remove(personParticipants, function(r) {
        return r.role.startsWith('DIRECTORY') || r.role.endsWith('_SUPPORT');
    });

    //get nodes
    let nodePromises = personNodes.map(function(n){
        return node(n.nodeId);
    });
    let nodes = await Promise.all(nodePromises);

    //get participants
    let participantIds = personParticipants.map(function(p){
        return p.participantId;
    });
    participantIds.concat(nodes.map(function(n){return n.participantId;}));
    let participantPromises = participantIds.map(function(id){
        return participant(id);
    });
    let participants = await Promise.all(participantPromises);

    //add node info to person
    nodes = _.keyBy(nodes, 'id');
    participants = _.keyBy(participants, 'id');

    personNodes.forEach(function(n){
        let node = nodes[n.nodeId];
        n.node = _.pick(node, ['id', 'name', 'participantId']);
        if (_.has(n, 'node.participantId')) {
            let p = participants[_.get(n, 'node.participantId')];
            n.participant = _.pick(p, ['id', 'type', 'participationStatus', 'countryCode', 'name']);
        }
    });

    personParticipants.forEach(function(p){
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
    return _.pick(p, ['id', 'firstName', 'surname', 'role', 'roles', 'title', 'jobTitle', 'phone', 'email', 'address', 'country', 'institutionName', 'countryCode', 'countryName', 'participants', 'nodes']);
}

function cleanParticipant(p) {
    let res = _.pick(p, ['id', 'name', 'type', 'participationStatus', 'participantUrl', 'membershipStart', 'mou2001Date', 'mou2001Signatory', 'mou2007Date', 'mou2007Signatory', 'mou2012Date', 'mou2012Signatory', 'gbifRegion', 'countryCode', 'people']);
    if (res.people) {
        res.people = res.people.map(function(e){
            e.person = cleanPerson(e.person);
            return e;
        });
    }
    return res;
}

function flattenParticipantPeople(participant) {
    if (!_.isArray(participant.people)) return [];
    let people = participant.people.map(function(p){
        p.person.participant_countryCode = participant.countryCode;
        p.person.participant_country = participant.name;
        p.person.participant_participationStatus = participant.participationStatus;
        p.person.role = p.role;
        p.person.roleOrder = p.role == 'HEAD_OF_DELEGATION' ? 0 : 1;
        return p.person;
    });
    return people;
}
