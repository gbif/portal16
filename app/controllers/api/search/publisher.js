"use strict";

var apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect,
    querystring = require('querystring'),
    request = require('requestretry');

async function get(key, depth) {
    depth = depth || 0;
    let baseRequest = {
        url: apiConfig.publisher.url + key,
        timeout: 30000,
        method: 'GET',
        json: true
    };
    let publisher = await request(baseRequest);
    if (publisher.statusCode > 299) {
        throw publisher;
    }
    if (depth > 0) {
        depth--;
        return expand(publisher.body, depth);
    } else {
        return publisher.body;
    }
}

async function expand(publisher){
    return publisher;
    //expect(node).to.be.an('object');
    //
    //let identifiers = node.identifiers || [],
    //    directoryParticipant = _.find(identifiers, {type: 'GBIF_PARTICIPANT'});
    //node.participantId = _.get(directoryParticipant, 'identifier');
    //return node;
}

async function query(query, options){
    options = options || {};
    query = query || {};

    let baseRequest = {
        url: apiConfig.publisher.url + '?' + querystring.stringify(query),
        timeout: options.timeout || 30000,
        method: 'GET',
        json: true
    };

    let publishers = await request(baseRequest);
    if (publishers.statusCode > 299) {
        throw publishers;
    }
    return publishers.body;
}

module.exports = {
    get: get,
    query: query
};