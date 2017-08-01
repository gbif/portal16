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
    personSearch: personSearch
};

async function getCommittee(type) {
    return proxyGet(apiConfig.directoryCommittee.url + type);
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

async function personSearch(query) {
    let people = await proxyGet(apiConfig.directoryPerson.url + '?' + querystring.stringify(query));
    people.results = people.results.map(cleanPerson);
    return people;
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
    return _.pick(p, ['id', 'firstName', 'surname', 'role', 'roles', 'title', 'jobTitle', 'phone', 'email', 'address', 'country', 'institutionName', 'countryCode', 'countryName']);
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