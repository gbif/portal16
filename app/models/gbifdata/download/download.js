"use strict";

var resource = require('../resource'),
    _ = require('lodash'),
    api = require('../apiConfig');

var Download = function (record) {
    this.record = record;
};

Download.prototype.record = {};

Download.get = function (key, options) {
    options = options || {};
    var promise = resource.get(api.occurrenceDownload.url + key).as(Download);
    if (typeof options.expand === 'undefined') {
        return promise
    } else {
        return promise.then(function (Download) {
            return Download.expand(options.expand)
        });
    }
};

Download.prototype.expand = function (fieldNames) {
    var resources = [],
        resourceLookup = {
            news: {
                resource: cmsConfig.search.url + '?sort=-created&page[size]=3&filter[type]=news&filter[category_Download]=' + this.record.Download,
                extendToField: 'news'
            },
            events: {
                resource: cmsConfig.search.url + '?sort=-created&page[size]=3&filter[type]=event&filter[category_Download]=' + this.record.Download,
                extendToField: 'events'
            },
            dataUse: {
                resource: cmsConfig.search.url + '?sort=-created&page[size]=3&filter[type]=data_use&filter[category_Download]=' + this.record.Download,
                extendToField: 'dataUse'
            },
            participant: {
                resource: cmsConfig.participant.url + participantId,
                extendToField: 'participant'
            }
        };

    //fieldNames.forEach(function (e) {
    //    if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    //});
    return resource.extend(this).with(resources);
};

module.exports = Download;
