"use strict";

var resource = require('../resource'),
    cmsConfig = require('../../cmsData/apiConfig'),
    apiConfig = require('../../gbifdata/apiConfig'),
    _ = require('lodash'),
    api = require('../apiConfig');

var Node = function (record) {
    this.record = record;
};

Node.prototype.record = {};

Node.get = function (key, options) {
    options = options || {};
    var promise = resource.get(api.node.url + key).as(Node);
    if (typeof options.expand === 'undefined') {
        return promise
    } else {
        return promise.then(function (node) {
            return node.expand(options.expand)
        });
    }
};

Node.getByCountryCode = function (countryCode, options) {
    options = options || {};
    var promise = resource.get(api.country.url + countryCode).as(Node);
    if (typeof options.expand === 'undefined') {
        return promise
    } else {
        return promise.then(function (country) {
            return country.expand(options.expand)
        });
    }
};

Node.prototype.expand = function (fieldNames) {
    var resources = [],
        resourceLookup = {
            news: {
                resource: cmsConfig.search.url + '?sort=-created&page[size]=3&filter[type]=news&filter[category_country]=' + this.record.country,
                extendToField: 'news'
            },
            events: {
                resource: cmsConfig.search.url + '?sort=-created&page[size]=3&filter[type]=event&filter[category_country]=' + this.record.country,
                extendToField: 'events'
            },
            dataUse: {
                resource: cmsConfig.search.url + '?sort=-created&page[size]=3&filter[type]=data_use&filter[category_country]=' + this.record.country,
                extendToField: 'dataUse'
            }
        };

    //if node has a participant id from the direcotory then use that to resolve the drupal participant data
    let identifiers = _.get(this.record, 'identifiers', []);
    let identifier = _.find(identifiers, {type: 'GBIF_PARTICIPANT'});
    let participantId = _.get(identifier, 'identifier');
    if (typeof participantId !== 'undefined') {

        resourceLookup.participant = {
            resource: cmsConfig.participant.url + participantId,
            extendToField: 'participant'
            //options: {failHard: false}//unclear if this should rather fail hard
        };

        resourceLookup.directoryParticipant = {
            resource: apiConfig.directoryParticipant.url + participantId,
            extendToField: 'directoryParticipant'
        };
    }

    fieldNames.forEach(function (e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Node;
