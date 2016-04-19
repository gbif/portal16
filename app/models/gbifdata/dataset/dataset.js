"use strict";

var	resource = require('../resource'),
    api = require('../apiConfig');

var Dataset = function (record) {
    this.record = record;
};

Dataset.prototype.record = {};

Dataset.get = function (key, options) {
    var options = options || {};
    var promise = resource.get(api.dataset.url + key).as(Dataset);
    if (typeof options.expand === 'undefined') {
        return promise
    } else {
        return promise.then(function(dataset) {
            return dataset.expand(options.expand)
        });
    }
};

Dataset.prototype.expand = function (fieldNames) {
    var resources = [],
        resourceLookup = {
            publisher: {
                resource: api.publisher.url + this.record.publishingOrganizationKey,
                extendToField: 'publisher'
            },
            installation: {
                resource: api.installation.url + this.record.installationKey,
                extendToField: 'installation'
            }
        };
    fieldNames.forEach(function(e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};



module.exports = Dataset;
