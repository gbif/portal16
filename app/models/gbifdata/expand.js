'use strict';
let helper = require('../util/util'),
    _ = require('lodash'),
    async = require('async');

function getTasks(list, settings, __) {
    let tasks = [];
    let facetTypeConfig = settings.expandConfig;
    Object.keys(list).forEach(function(facetType) {
        let ftc = facetTypeConfig[facetType];
        list[facetType].forEach(function(e) {
            if (typeof ftc === 'undefined') {
                e.title = e.name;
            } else if (ftc.type == 'ENUM') {
                e.title = __(ftc.translationPath + e.name);
            } else if (ftc.type == 'KEY') {
                let task = {
                    endpoint: ftc.endpoint + e.name,
                    cb: function(err, data) {
                        e.title = data[ftc.fromKey];
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

/**
 * Expand facet names for keys, expand filters keys, expand keys and (translated) enums in result list
 * @param data : the java api result
 * @param config : define what to expand
 * @param __ : translation object
 * @param cb : callback when completed. cb(error if any, expanded results)
 */
function expand(data, settings, __, cb) {
    try {
        settings = settings || {};
        let tasks = [],
            facetTasks = [],
            filterTasks = [];
        if (settings.query) {
            // expand query
            filterTasks = getFilterTasks(data, settings, __);
        }
        if (settings.facets) {
            // expand facets
            facetTasks = getFacetTasks(data, settings, __);
        }
        tasks = tasks.concat(facetTasks).concat(filterTasks);


        async.parallel({
            facetFilters: function(callback) {
                async.eachLimit(tasks, 25, expandKey, callback);
            },
            resultList: function(callback) {
                getResultTasks(data.results, settings.expandList, callback);
            }
        }, function(err) {
            if (err) {
                cb(err, data);
            } else {
                if (data.facets) {
                    data.facets = facetArrayToMap(data);
                }
                // addFilterFacets(data.facets, );
                cb(null, data);
            }
        });

        // getResultTasks(data.results, config.resultKeys, cb);
        // async.each(tasks, expandKey, cb);
    } catch (e) {
        // TODO log error
        console.log(e);
    }
}

function facetArrayToMap(data) {
    let facetMap = {};
    Object.keys(data.facets).forEach(function(key) {
        let facetType = data.facets[key];
        facetMap[key] = {};
        let facetCountMap = {};
        let max = 0;
        facetType.forEach(function(e) {
            facetCountMap[e.name] = {
                count: e.count,
                fraction: e.count / data.count,
                title: e.title
            };
            max = e.count > max ? e.count : max;
        });
        facetMap[key].max = max;
        facetMap[key].counts = facetCountMap;
    });
    return facetMap;
}

function getFacetTasks(data, settings, __) {
    let facetMap = {};
    // create map of facets instead of list
    data.facets.forEach(function(e) {
        facetMap[e.field] = e.counts;
    });
    data.facets = facetMap;
    // get facet tasks
    return getTasks(data.facets, settings, __);
}

function getFilterTasks(data, settings, __) {
    // create map similar to facets with filters to be expanded
    let query = settings.query || {};
    let facetTypeConfig = settings.expandConfig;
    data.filters = {};
    Object.keys(query).forEach(function(key) {
        let k = key.toUpperCase();
        // if (['facet', 'locale', 'offset', 'limit'].indexOf(key) >= 0) return;

        // if there is not defined expansion configuration then ignore
        if (_.isUndefined(facetTypeConfig[k])) return;
        data.filters[k] = [];

        let queryParams = [].concat(query[key]);
        queryParams.forEach(function(e) {
            data.filters[k].push({
                name: e
            });
        });
    });
    return getTasks(data.filters, settings, __);
}

function filterObj(obj, reference) {
    let keysToDelete = _.difference(_.keys(obj), reference);
    keysToDelete.forEach(function(key) {
        delete obj[key];
    });
    return obj;
}

/**
 * expand api result list items with keys to their associated resource
 * @param results : the results from the data api
 * @param expandList : a configuration list for which keys to expand and how
 *  [{fromKey: [string - the key to expand],
 *  configKey: [string - enum name in config list],
 *  fields: [array of field names from the associated resource to include] }]
 * @param cb
 */
function getResultTasks(results, expandList, cb) {
    let tasks = {};
    // create 1 task per key as there is no reason to do 20 lookups of the same key. and results often have fx the same datasetKey
    if (!_.isArray(expandList)) {
        expandList = [];
    }
    expandList.forEach(function(expandItem) {
        let fromKey = expandItem.fromKey,
            expandConfig = expandItem.type;
        results.forEach(function(e) {
            if (expandConfig && expandConfig.type == 'KEY') {
                tasks[fromKey + '_' + e[fromKey]] = function(cb) {
                    helper.getApiData(expandConfig.endpoint + e[fromKey], cb);
                };
            } else if (expandConfig && expandConfig.type == 'TEMPLATE') {
                tasks[fromKey + '_' + e[fromKey]] = function(cb) {
                    helper.getApiData(expandConfig.templatedEndpoint.replace('{{key}}', e[fromKey]), cb);
                };
            }
        });
    });

    // run tasks
    async.parallel(tasks, function(err, data) {
        if (_.isUndefined(err)) {
            cb(new Error(err), null);
        } else {
            // once all the keys and their values is returned, then attach to the individual results that have that specific key
            results.forEach(function(e) {
                // prune the extended results to keep the response json small
                expandList.forEach(function(expandItem) {
                    let toKey = expandItem.toKey || expandItem.fromKey;
                    e['_' + toKey] = filterObj(data[expandItem.fromKey + '_' + e[expandItem.fromKey]], expandItem.fields || ['title']);
                });
            });
            cb();
        }
    });
}

function expandKey(task, callback) {
    helper.getApiData(task.endpoint, function(err, data) {
        task.cb(err, data);
        callback(null, true);
    }, {timeoutMilliSeconds: 5000, retries: 3});
}

module.exports = {
    expand: expand
};
