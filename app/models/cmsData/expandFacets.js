"use strict";
var helper = require('../util/util'),
    apiConfig = require('./apiConfig'),
    async = require('async');

const facetTypeConfig = {
    type: {
        type: 'enum',
        translationPath: 'cms.type.'
    },
    language: {
        type: 'enum',
        translationPath: 'language.'
    },
    category_informatics: {
        type: 'id',
        endpoint: apiConfig.tag.url,
        fromKey: 'title'
    },
    category_data_use: {
        type: 'id',
        endpoint: apiConfig.tag.url,
        fromKey: 'title'
    },
    category_capacity_enhancement: {
        type: 'id',
        endpoint: apiConfig.tag.url,
        fromKey: 'title'
    },
    category_about_gbif: {
        type: 'id',
        endpoint: apiConfig.tag.url,
        fromKey: 'title'
    },
    category_audience: {
        type: 'id',
        endpoint: apiConfig.tag.url,
        fromKey: 'title'
    },
    category_purpose: {
        type: 'id',
        endpoint: apiConfig.tag.url,
        fromKey: 'title'
    },
    category_data_type: {
        type: 'id',
        endpoint: apiConfig.tag.url,
        fromKey: 'title'
    },
    category_resource_type: {
        type: 'id',
        endpoint: apiConfig.tag.url,
        fromKey: 'title'
    },
    category_country: {
        type: 'id',
        endpoint: apiConfig.tag.url,
        fromKey: 'title'
    },
    category_topic: {
        type: 'id',
        endpoint: apiConfig.tag.url,
        fromKey: 'title'
    },
    category_tags: {
        type: 'id',
        endpoint: apiConfig.tag.url,
        fromKey: 'title'
    }
};

function expandFacets(facets, __, cb) {
    var tasks = [];
    facets.forEach(function(facetType){
        let ftc = facetTypeConfig[facetType.field];
        facetType.counts.forEach(function(e){
            if (typeof ftc === 'undefined' || typeof ftc.type === 'undefined') {
                e.title = e.enum;
                e.key = e.enum;
            } else if (ftc.type == 'enum') {
                e.title = __(ftc.translationPath + e.enum);
                e.key = e.enum;
            } else if (ftc.type == 'id') {
                e.title = e.id;
                e.key = e.id;
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