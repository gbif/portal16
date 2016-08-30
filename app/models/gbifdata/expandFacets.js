"use strict";
var helper = require('../util/util'),
    apiConfig = require('./apiConfig'),
    _ = require('lodash'),
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
    },
    BASIS_OF_RECORD: {
        type: 'ENUM',
        translationPath: 'basisOfRecord.'
    }
};

//function getTasks(list, __) {
//    var tasks = [];
//    list.forEach(function(facetType){
//        let ftc = facetTypeConfig[facetType.field];
//        facetType.counts.forEach(function(e){
//            if (typeof ftc === 'undefined') {
//                e.title = e.name;
//            } else if (ftc.type == 'ENUM') {
//                e.title = __(ftc.translationPath + e.name)
//            } else if (ftc.type == 'KEY') {
//                var task = {
//                    endpoint: ftc.endpoint + e.name,
//                    cb: function(err, data){
//                        e.title = data[ftc.fromKey]
//                    }
//                };
//                tasks.push(task);
//            } else {
//                e.title = e.name;
//            }
//        });
//    });
//    return tasks;
//}

function getTasks(list, __) {
    var tasks = [];
    Object.keys(list).forEach(function(facetType){
        let ftc = facetTypeConfig[facetType];
        list[facetType].forEach(function(e){
            if (typeof ftc === 'undefined') {
                e.title = e.name;
            } else if (ftc.type == 'ENUM') {
                e.title = __(ftc.translationPath + e.name)
            } else if (ftc.type == 'KEY') {
                var task = {
                    endpoint: ftc.endpoint + e.name,
                    cb: function(err, data){
                        e.title = data[ftc.fromKey]
                    }
                };
                tasks.push(task);
            } else {
                e.title = e.name;
            }
        });
    });
    return tasks;
}

function expandFacetsAndFilters(data, query, __, cb) {
    let facets = {};
    data.facets.forEach(function(e){
        facets[e.field] = e.counts;
    });
    data.facets = facets;
    let tasks = getTasks(data.facets, __);

    data.filters = {};
    Object.keys(query).forEach(function(key){
        let k = key.toUpperCase();
        if (['facet', 'locale', 'offset', 'limit'].indexOf(key) >= 0) return;
        data.filters[k] = [];
        if (_.isString(query[key])) {
            data.filters[k].push({
                name: query[key]
            });
        } else if (_.isArray(query[key])) {
            query[key].forEach(function(e){
                data.filters[k].push({
                    name: e
                });
            });
        }
    });

    tasks = tasks.concat(getTasks(data.filters, __));
    async.each(tasks, expandKey, cb);
}

function expandKey(task, callback) {
    helper.getApiData(task.endpoint, function(err, data){
        task.cb(err, data);
        callback(null, true);
    }, {timeoutMilliSeconds: 5000, retries: 3});
}

module.exports = expandFacetsAndFilters;