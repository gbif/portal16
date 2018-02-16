'use strict';

let resource = require('../resource'),
    api = require('../apiConfig');

let Publisher = function(record) {
    this.record = record;
};

Publisher.prototype.record = {};

Publisher.get = function(key, options) {
    options = options || {};
    let promise = resource.get(api.publisher.url + key).as(Publisher);
    if (typeof options.expand === 'undefined') {
        return promise;
    } else {
        return promise.then(function(publisher) {
            return publisher.expand(options.expand);
        });
    }
};

Publisher.prototype.expand = function(fieldNames) {
    let resources = [],
        resourceLookup = {
            endorsingNode: {
                resource: api.node.url + this.record.endorsingNodeKey,
                extendToField: 'endorsingNode'
            },
            datasets: {
                resource: api.dataset.url + 'search?limit=1000&publishingOrg=' + this.record.key,
                extendToField: 'datasets'
            },
            occurrences: {
                resource: api.occurrenceSearch.url + '?limit=0&publishingOrg=' + this.record.key,
                extendToField: 'occurrences'
            },
            hostedDataset: {
                resource: api.publisher.url + this.record.key + '/hostedDataset',
                extendToField: 'hostedDataset'
            },
            installation: {
                resource: api.publisher.url + this.record.key + '/installation',
                extendToField: 'installation'
            }
        };
    fieldNames.forEach(function(e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Publisher;
