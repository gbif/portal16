'use strict';

let resource = require('../resource'),
    apiConfig = require('../../gbifdata/apiConfig'),
    _ = require('lodash'),
    api = require('../apiConfig');

let Node = function(record) {
    this.record = record;
};

Node.prototype.record = {};

Node.get = function(key, options) {
    options = options || {};
    let promise = resource.get(api.node.url + key).as(Node, {failHard: true, failOnNoContent: true});
    if (typeof options.expand === 'undefined') {
        return promise;
    } else {
        return promise.then(function(node) {
            return node.expand(options.expand);
        });
    }
};

Node.getByCountryCode = function(countryCode, options) {
    options = options || {};
    let promise = resource.get(api.country.url + countryCode).as(Node, {failHard: true, failOnNoContent: true});
    if (typeof options.expand === 'undefined') {
        return promise;
    } else {
        return promise.then(function(country) {
            return country.expand(options.expand);
        });
    }
};

Node.prototype.expand = function(fieldNames) {
    let resources = [],
        resourceLookup = {
        };

    // if node has a participant id from the direcotory then use that to resolve the drupal participant data
    let identifiers = _.get(this.record, 'identifiers', []);
    let identifier = _.find(identifiers, {type: 'GBIF_PARTICIPANT'});
    let participantId = _.get(identifier, 'identifier');
    if (typeof participantId !== 'undefined') {
        resourceLookup.directoryParticipant = {
            resource: apiConfig.directoryParticipant.url + participantId,
            extendToField: 'directoryParticipant'
        };
    }

    fieldNames.forEach(function(e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    this.record.__TESTER = 'MORTEN';
    return resource.extend(this).with(resources);
};

module.exports = Node;
