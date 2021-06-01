'use strict';

let resource = require('../resource'),
    _ = require('lodash'),
    api = require('../apiConfig');

let Occurrence = function(record) {
    this.record = record;
};

Occurrence.prototype.record = {};

Occurrence.get = function(key, options) {
    options = options || {};
    let promise = resource.get(api.occurrence.url + key).as(Occurrence);
    if (typeof options.expand === 'undefined') {
        return promise;
    } else {
        return promise.then(function(occurrence) {
            return occurrence.expand(options.expand);
        });
    }
};

Occurrence.prototype.expand = function(fieldNames) {
    let resources = [],
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
                resource: api.dataset.url + this.record.datasetKey + '/process?limit=50',
                extendToField: 'datasetProcess'
            },
            fragment: {
                resource: api.occurrence.url + this.record.key + '/fragment',
                extendToField: 'fragment'
            },
            verbatim: {
                resource: api.occurrence.url + this.record.key + '/verbatim',
                extendToField: 'verbatim'
            },
            species: {
                resource: api.taxon.url + this.record.taxonKey,
                extendToField: 'species'
            },
            vernacular: {
                resource: api.taxon.url + this.record.taxonKey + '/vernacularNames',
                extendToField: 'vernacular'
            }
        };

    if (!_.isUndefined(this.record.taxonKey)) {
        resourceLookup.taxonName = {
            resource: api.taxon.url + this.record.taxonKey + '/name',
            extendToField: 'taxonName'
        };
    }
    if (!_.isUndefined(this.record.institutionKey)) {
      resourceLookup.institution = {
        resource: api.institution.url + this.record.institutionKey,
        extendToField: 'institution'
      };
    }
    if (!_.isUndefined(this.record.collectionKey)) {
      resourceLookup.collection = {
        resource: api.collection.url + this.record.collectionKey,
        extendToField: 'collection'
      };
    }

    fieldNames.forEach(function(e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Occurrence;
