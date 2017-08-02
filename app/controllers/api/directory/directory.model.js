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
    return cleanPerson(person);
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
