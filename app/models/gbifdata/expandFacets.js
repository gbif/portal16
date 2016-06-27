"use strict";
var helper = require('../util/util'),
    apiConfig = require('./apiConfig'),
    async = require('async');

const facetTypeConfig = {
    TYPE: {
        type: 'ENUM',
        translationPath: 'dataset.type.'
    },
    PUBLISHING_COUNTRY: {
        type: 'ENUM',
        translationPath: 'country.'
    },
    PUBLISHING_ORG: {
        type: 'KEY',
        endpoint: apiConfig.publisher.url,
        fromKey: 'title'
    },
    HOSTING_ORG: {
        type: 'KEY',
        endpoint: apiConfig.publisher.url,
        fromKey: 'title'
    }
};

function expandFacets(facets, __, cb) {
    var tasks = [];
    facets.forEach(function(facetType){
        let ftc = facetTypeConfig[facetType.field];
        facetType.counts.forEach(function(e){
            if (typeof ftc === 'undefined' || typeof ftc.type === 'undefined' || ftc.type == 'VALUE') {
                e.title = e.name;
            }else if (ftc.type == 'ENUM') {
                e.title = __(ftc.translationPath + e.name)
            } else if(ftc.type == 'KEY') {
                var task = {
                    facet: e,
                    endpoint: ftc.endpoint + e.name,
                    fromKey: ftc.fromKey
                };
                tasks.push(task);
            } else {
                e.title = e.name;
            }
        });
    });
    async.each(tasks, expandKey, cb);
}

function expandKey(obj, callback) {
    helper.getApiData(obj.endpoint, function(err, data){
        obj.facet.title = data[obj.fromKey];
        callback(null, obj.facet);
    }, {timeoutMilliSeconds: 5000, retries: 3});
}

module.exports = expandFacets;