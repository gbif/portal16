"use strict";

var resource = require('../resource'),
    cmsConfig = require('../../cmsData/apiConfig'),
    _ = require('lodash'),
    participantDump = require('./participant-dump'),
    countryCodeToDrupalId = _.keyBy(participantDump, 'Participant ISO 3166-2 code'),//temporary solution because the Drupal api do not allow for getting participants by their ISO code. Instead we do a map between ISO and internal Drupal node id
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
        return promise.then(function (country) {
            return country.expand(options.expand)
        });
    }
};

Node.prototype.expand = function (fieldNames) {
    var participantId,
        participant = countryCodeToDrupalId[this.record.country.toUpperCase()];//use temporary mapping object as Drupal do not allow search by ISO

    if (typeof participant !== 'undefined') {
        participantId = participant.Nid;
    }

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
            },
            participant: {
                resource: cmsConfig.participant.url + participantId,
                extendToField: 'participant'
            }
        };

    fieldNames.forEach(function (e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Node;
