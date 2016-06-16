"use strict";

var resource = require('../resource'),
    api = require('../apiConfig');

var Publisher = function (record) {
    this.record = record;
};

Publisher.prototype.record = {};

Publisher.get = function (key, options) {
    options = options || {};
    var promise = resource.get(api.publisher.url + key).as(Publisher);
    if (typeof options.expand === 'undefined') {
        return promise
    } else {
        return promise.then(function (publisher) {
            return publisher.expand(options.expand)
        });
    }
};

Publisher.prototype.expand = function (fieldNames) {
    var resources = [],
        resourceLookup = {
            endorsingNode: {
                resource: api.node.url + this.record.endorsingNodeKey,
                extendToField: 'endorsingNode'
            },
            datasets: {
                resource: api.dataset.url + 'search?limit=1000&publishingOrg=' + this.record.key,
                extendToField: 'datasets'
            }
        };
    fieldNames.forEach(function (e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Publisher;
