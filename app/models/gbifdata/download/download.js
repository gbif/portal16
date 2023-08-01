'use strict';

let resource = require('../resource'),
    api = require('../apiConfig');

let Download = function(record) {
    this.record = record;
};

Download.prototype.record = {};

Download.get = function(key, options) {
    options = options || {};
    let promise = resource.get(api.occurrenceDownload.url + key + '?statistics=true').as(Download);
    if (typeof options.expand === 'undefined') {
        return promise;
    } else {
        return promise.then(function(Download) {
            return Download.expand(options.expand);
        });
    }
};

Download.prototype.expand = function() {
    let resources = [];
    return resource.extend(this).with(resources);
};

module.exports = Download;
