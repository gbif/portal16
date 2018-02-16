'use strict';

let resource = require('../resource'),
    api = require('../apiConfig');

let Network = function(record) {
    this.record = record;
};

Network.prototype.record = {};

Network.get = function(key, options) {
    options = options || {};
    let promise = resource.get(api.network.url + key).as(Network);
    if (typeof options.expand === 'undefined') {
        return promise;
    } else {
        return promise.then(function(network) {
            return network.expand(options.expand);
        });
    }
};

Network.prototype.expand = function(fieldNames) {
    let resources = [],
        resourceLookup = {};
    fieldNames.forEach(function(e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Network;
