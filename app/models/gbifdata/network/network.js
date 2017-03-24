"use strict";

var resource = require('../resource'),
    api = require('../apiConfig');

var Network = function (record) {
    this.record = record;
};

Network.prototype.record = {};

Network.get = function (key, options) {
    options = options || {};
    var promise = resource.get(api.network.url + key).as(Network);
    if (typeof options.expand === 'undefined') {
        return promise
    } else {
        return promise.then(function (network) {
            return network.expand(options.expand)
        });
    }
};

Network.prototype.expand = function (fieldNames) {
    var resources = [],
        resourceLookup = {};
    fieldNames.forEach(function (e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Network;
