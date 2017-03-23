"use strict";

var resource = require('../resource'),
    api = require('../apiConfig');

var Installation = function (record) {
    this.record = record;
};

Installation.prototype.record = {};

Installation.get = function (key, options) {
    options = options || {};
    var promise = resource.get(api.installation.url + key).as(Installation);
    if (typeof options.expand === 'undefined') {
        return promise
    } else {
        return promise.then(function (installation) {
            return installation.expand(options.expand)
        });
    }
};

Installation.prototype.expand = function (fieldNames) {
    var resources = [],
        resourceLookup = {
            endorsingPublisher: {
                resource: api.publisher.url + this.record.organizationKey,
                extendToField: 'endorsingPublisher'
            }
        };
    fieldNames.forEach(function (e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Installation;
