"use strict";

var resource = require('../resource'),
    api = require('../apiConfig');

var Taxon = function (record) {
    this.record = record;
};

Taxon.prototype.record = {};

Taxon.get = function (key, options) {
    options = options || {};
    var promise = resource.get(api.taxon.url + key).as(Taxon);
    if (typeof options.expand === 'undefined') {
        return promise
    } else {
        return promise.then(function (taxon) {
            return taxon.expand(options.expand)
        });
    }
};

Taxon.prototype.expand = function (fieldNames) {
    var resources = [],
        resourceLookup = {
            dataset: {
                resource: api.dataset.url + this.record.datasetKey,
                extendToField: 'dataset'
            },
            vernacular: {
                resource: api.taxon.url + this.record.key + '/vernacularNames',
                extendToField: 'vernacular'
            }
        };
    fieldNames.forEach(function (e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Taxon;
