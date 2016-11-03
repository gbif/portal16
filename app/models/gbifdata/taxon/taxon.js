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

Taxon.prototype.isNub = function () {
    return this.record.datasetKey == 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c';
};

Taxon.prototype.expand = function (fieldNames) {
    var resources = [],
        resourceLookup = {
            name: {
                resource: api.taxon.url + this.record.key + '/name',
                extendToField: 'name'
            },
            dataset: {
                resource: api.dataset.url + this.record.datasetKey,
                extendToField: 'dataset'
            },
            parents: {
                resource: api.taxon.url + this.record.key + '/parents',
                extendToField: 'parents'
            },
            synonyms: {
                resource: api.taxon.url + this.record.key + '/synonyms',
                extendToField: 'synonyms'
            },
            combinations: {
                resource: api.taxon.url + this.record.key + '/combinations',
                extendToField: 'combinations'
            },
            media: {
                resource: api.taxon.url + this.record.key + '/media?limit=50',
                extendToField: 'media'
            },
            occurrenceCount: {
                resource: api.occurrence.url + 'count?taxonKey=' + this.record.key,
                extendToField: 'occurrenceCount'
            },
            occurrenceGeoRefCount: {
                resource: api.occurrence.url + 'count?isGeoreferenced=true&taxonKey=' + this.record.key,
                extendToField: 'occurrenceGeoRefCount'
            },
            occurrenceImages: {
                resource: api.occurrenceSearch.url + '?limit=35&media_type=stillImage&taxonKey=' + this.record.key,
                extendToField: 'occurrenceImages'
            },
            references: {
                resource: api.taxon.url + this.record.key + '/references',
                extendToField: 'references'
            },
            related: {
                resource: api.taxon.url + this.record.key + '/related?limit=50',
                extendToField: 'related'
            },
            homonyms: {
                resource: api.taxon.url + '?datasetKey=' + this.record.datasetKey + "&name=" + this.record.canonicalName,
                extendToField: 'homonyms'
            },
            info: {
                resource: api.taxon.url + this.record.key + '/speciesProfiles?limit=50',
                extendToField: 'info'
            },
            typification: {
                resource: api.taxon.url + this.record.key + '/typeSpecimens',
                extendToField: 'typification'
            },
            verbatim: {
                resource: api.taxon.url + this.record.key + '/verbatim',
                extendToField: 'verbatim'
            },
            vernacular: {
                resource: api.taxon.url + this.record.key + '/vernacularNames?limit=50',
                extendToField: 'vernacular'
            }
        };
    // add optional resources
    if (this.record.constituentKey) {
        resourceLookup.constituent = {
            resource: api.dataset.url + this.record.constituentKey,
            extendToField: 'constituent'
        }
    }

    fieldNames.forEach(function (e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Taxon;
