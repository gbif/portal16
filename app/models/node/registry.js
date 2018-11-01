'use strict';

let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect,
    request = rootRequire('app/helpers/request');

async function getNodeById(id) {
    let baseRequest = {
        url: apiConfig.node.url + id,
        timeout: 30000,
        method: 'GET',
        json: true
    };
    let node = await request(baseRequest);
    if (node.statusCode > 299) {
        throw node;
    }
    // decorateNode(node.body);
    return node.body;
}

async function getNodeByIso(iso) {
    let baseRequest = {
        url: apiConfig.country.url + iso,
        timeout: 30000,
        method: 'GET',
        json: true
    };
    let node = await request(baseRequest);
    if (node.statusCode > 299) {
        throw node;
    }
    decorateNode(node.body);
    return node.body;
}

function decorateNode(node) {
    expect(node).to.be.an('object');

    let identifiers = node.identifiers || [],
        directoryParticipant = _.find(identifiers, {type: 'GBIF_PARTICIPANT'});
    node.participantId = _.get(directoryParticipant, 'identifier');
    return node;
}

module.exports = {
    get: getNodeById,
    getNodeByIso: getNodeByIso
};
