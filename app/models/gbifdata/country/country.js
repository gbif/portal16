"use strict";

var resource = require('../resource'),
    cmsSearchUrl = require('../../cmsData/apiConfig').search.url,
    api = require('../apiConfig');

var Country = function (record) {
    this.record = record;
};

Country.prototype.record = {};

Country.get = function (key, options) {
    options = options || {};
    var promise = resource.get(api.country.url + key).as(Country);
    if (typeof options.expand === 'undefined') {
        return promise
    } else {
        return promise.then(function (country) {
            return country.expand(options.expand)
        });
    }
};

Country.prototype.expand = function (fieldNames) {
    var resources = [],
        resourceLookup = {
            news: {
                resource: cmsSearchUrl + '?sort=-created&page[size]=3&filter[type]=news&filter[category_country]=' + this.record.country,
                extendToField: 'news'
            },
            events: {
                resource: cmsSearchUrl + '?sort=-created&page[size]=3&filter[type]=event&filter[category_country]=' + this.record.country,
                extendToField: 'events'
            },
            dataUse: {
                resource: cmsSearchUrl + '?sort=-created&page[size]=3&filter[type]=data_use&filter[category_country]=' + this.record.country,
                extendToField: 'dataUse'
            }
        };
    fieldNames.forEach(function (e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Country;
