let credentials = rootRequire('config/credentials').directory,
    crypto = require('crypto'),
    request = require('requestretry'),
    apiConfig = require('../gbifdata/apiConfig'),
    resource = rootRequire('app/controllers/resource/key/resourceKey'),
    _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect,
    log = rootRequire('config/log'),
    querystring = require('querystring');

async function signedGet(requestUrl) {
    let appKey = credentials.appKey;
    let secret = credentials.secret;

    var options = {
        url: requestUrl,
        fullResponse: true,
        json: true,
        maxAttempts: 2,
        timeout: 30000,
        method: 'GET',
        headers: {
            'x-gbif-user': appKey,
            'x-url': requestUrl
        }
    };

    let stringToSign = options.method + '\n' + requestUrl + '\n' + appKey;
    let signature = crypto.createHmac('sha1', secret).update(stringToSign).digest('base64');
    options.headers.Authorization = 'GBIF ' + appKey + ':' + signature;
    let response = await request(options);
    if (response.statusCode > 299) {
        throw (response);
    }
    return response.body;
}


async function getNodeById(id) {
    expect(id).to.be.ok;
    let node = await signedGet(apiConfig.directoryNode.url + id);
    let people = await getNodePeople(id);
    node.contacts = people;
    return node;
}

function getParticipant(key, locale) {
    let participantPromise;

    var promise = new Promise(function (resolve, reject) {
        if (! isNaN(key) || key.match(/^[0-9]+$/)) {
            participantPromise = getParticipantById(key);
        } else {
            participantPromise = getParticipantByIso(key);
        }

        participantPromise
            .then(function (participant) {
                expandParticipant(participant, locale)
                    .then(function (result) {
                        resolve(result);
                    })
                    .catch(function (err) {
                        //ignore missing relations
                        log.error({error: err}, 'Failing relations in participant request');
                        resolve({
                            participant: participant,
                            _incomplete: true
                        });
                    });
            })
            .catch(function (err) {
                reject(err);
            });
    });
    return promise;
}

async function getParticipantByIso(isoCode) {
    let query = {
        country: isoCode
    };
    let participantSearchResults = await signedGet(apiConfig.directoryParticipant.url + '?' + querystring.stringify(query));
    let participantItem = _.find(participantSearchResults.results, {countryCode: isoCode, type: 'COUNTRY'});
    if (_.isUndefined(_.get(participantItem, 'id'))) {
        throw {
            statusCode: 404,
            message: 'No participant with that iso code: ' + isoCode
        }
    }
    let participant = await getParticipantById(participantItem.id);
    return participant;
}

async function getParticipantsByType(type) {
    let query = {
        type: type,
        limit: 2000
    };
    let participantSearchResults = await signedGet(apiConfig.directoryParticipant.url + '?' + querystring.stringify(query));
    return participantSearchResults;
}

async function getParticipantById(id) {
    let participant = await signedGet(apiConfig.directoryParticipant.url + id);
    return participant;
}

async function expandParticipant(participant, locale) {
    expect(participant).to.be.an('object');
    expect(participant).to.have.property('id');
    expect(participant).to.have.property('countryCode');
    expect(participant).to.have.deep.property('nodes[0].id');

    //get ids to query for
    let nodeId = _.get(participant, 'nodes[0].id'),
        id = participant.id,
        countryCode = participant.countryCode,

    //get first list of promises
        prosePromise = resource.getParticipant(id, 2, false, locale),
        participantHistoryPromise = signedGet(apiConfig.directoryParticipantPerson.url + '?status=all&participant_id=' + id),
        registryNodePromise = signedGet(apiConfig.node.url + '?identifier=' + id),
        nodePromise = getNodeById(nodeId),
        nodeHistoryPromise = signedGet(apiConfig.directoryNodePerson.url + '?status=all&node_id=' + nodeId);

    //wait for them to finish
    let values = await Promise.all([prosePromise, participantHistoryPromise, nodePromise, nodeHistoryPromise, registryNodePromise]),
    //asign them to nicer names
        prose = values[0],
        participantHistory = values[1],
        node = values[2],
        nodeHistory = values[3],
        registryNode = values[4].results[0];

    //get the people historical related to the participant and node
    let peopleIds = _.map(_.concat([], _.get(participantHistory, 'results', []), _.get(nodeHistory, 'results', [])), 'personId'),
        people = await getPeople(peopleIds),
    //remove sensitive information from the people objects
        contacts = people.map(removeSensitiveInformation);

    //transform contacts to map by ids to make it easier to look them up
    contacts = _.union(contacts);
    contacts = _.keyBy(contacts, 'id');

    //assign the values to the participant
    var result = {
        participant: participant,
        node: node,
        prose: prose,
        contacts: contacts,
        nodeHistory: nodeHistory.results,
        participantHistory: participantHistory.results,
        registryNode: registryNode,
        type: participant.type,
        country: {
            countryCode: participant.countryCode
        }
    };

    return result;
}

async function getPerson(id) {
    let person = await signedGet(apiConfig.directoryPerson.url + id);
    return person;
}

async function getPeople(idArray) {
    let peopleArray = idArray.map(function (id) {
        return getPerson(id);
    });
    return await Promise.all(peopleArray);
}

function removeSensitiveInformation(person) {
    return _.pick(person, ['id', 'firstName', 'surname', 'title', 'institutionName', 'email', 'phone', 'address', 'countryCode', 'countryName']);
}

async function getNodePeople(id) {
    let query = {
            node_id: id,
            status: 'all'
        },
        peopleRelationships = await signedGet(apiConfig.directoryNodePerson.url + '?' + querystring.stringify(query)),
        peopleIds = _.map(peopleRelationships.results, 'personId'),
        people = await getPeople(peopleIds),
        cleanPeople = people.map(removeSensitiveInformation);

    return cleanPeople;
}

module.exports = {
    get: getParticipant,
    getParticipantById: getParticipantById,
    getParticipantByIso: getParticipantByIso,
    getParticipantsByType: getParticipantsByType
};