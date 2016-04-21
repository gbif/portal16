"use strict";

var resource = require('../resource'),
    fields = require('./occurrenceFields'),
    api = require('../apiConfig');

var Occurrence = function (record) {
    this.record = record;
};

Occurrence.prototype.record = {};
Occurrence.prototype.fields = fields;

Occurrence.get = function (key, options) {
    options = options || {};
    var promise = resource.get(api.occurrence.url + key).as(Occurrence);
    if (typeof options.expand === 'undefined') {
        return promise
    } else {
        return promise.then(function (occurrence) {
            return occurrence.expand(options.expand)
        });
    }
};

Occurrence.prototype.expand = function (fieldNames) {
    var resources = [],
        resourceLookup = {
            publisher: {
                resource: api.publisher.url + this.record.publishingOrgKey,
                extendToField: 'publisher'
            },
            dataset: {
                resource: api.dataset.url + this.record.datasetKey,
                extendToField: 'dataset'
            },
            datasetProcess: {
                resource: api.dataset.url + this.record.datasetKey + '/process',
                extendToField: 'datasetProcess'
            },
            fragment: {
                resource: api.occurrence.url + this.record.key + '/fragment',
                extendToField: 'fragment'
            },
            verbatim: {
                resource: api.occurrence.url + this.record.key + '/verbatim',
                extendToField: 'verbatim'
            }
        };
    fieldNames.forEach(function (e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Occurrence;
