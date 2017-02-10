"use strict";

var express = require('express'),
    _ = require('lodash'),
    camelCase = require('camelcase'),
    async = require('async'),
    Q = require('q'),
    Download = require('../../../models/gbifdata/gbifdata').Download,
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    queryResolver = require('./queryResolver'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router(),
    intervalTypes = ['YEAR', 'EVENT_DATE', 'ELEVATION', 'DEPTH'];

module.exports = function (app) {
    app.use('/occurrence', router);
};


router.get('/download/:key\.:ext?', function (req, res, next) {
    var key = req.params.key,
        offset = req.query.offset || 0;

    var datasetsUrl = apiConfig.occurrenceDownload.url + key + '/datasets?offset=' + offset;
    Promise.all([getResource(datasetsUrl), Download.get(key)]).then(function(values){
        let datasets = values[0],
            download = values[1];
        download.datasets = datasets;
        download.datasets.results[0].numberRecords = 123123132;

        let promiseList = [];
        try{
            download.predicateString = JSON.stringify(download.record.request.predicate, undefined, 2);

            if (!download.record.request.predicate) {
                download.noFilters = true;
                renderPage(req, res, next, download);
            } else {
                addChildKeys(download.record.request.predicate);
                addSyntheticTypes(download.record.request.predicate);
                download.isSimple = getSimpleQuery(download.record.request.predicate);
                addpredicateResolveTasks(download.record.request.predicate, queryResolver, promiseList, res.__mf);
                flattenSameType(download.record.request.predicate);
                Promise.all(promiseList).then(function(){
                    renderPage(req, res, next, download);
                });
            }
        } catch(err){
            next(err);
        }

    }, function(err){
        console.log(err);
    });
});

function renderPage(req, res, next, download) {
    try {
        if (req.params.ext == 'debug') {
            res.json(download);
        } else {
            res.render('pages/occurrence/download/key/occurrenceDownloadKey', {
                download: download,
                title: 'Ocurrences',
                _meta: {
                    title: res.__('stdTerms.download')
                }
            });
        }
    } catch (e) {
        next(e);
    }
}

function addChildKeys(predicate, depth) {
    depth = depth || 0;
    depth++;
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else if (!predicate.predicates && !predicate.predicate) {
        if (predicate.type == 'within') {
            predicate.key = 'GEOMETRY';
            predicate.value = predicate.geometry;
        }
        predicate._childKeys = predicate.key;
        predicate._maxDepth = depth;
    } else if(predicate.predicate) {
        var child = addChildKeys(predicate.predicate, depth);
        predicate._childKeys = child._childKeys;
        predicate._maxDepth = Math.max(child._maxDepth, predicate._maxDepth || 0);
    } else {
        var children = predicate.predicates.map(function(p){
            return addChildKeys(p, depth);
        });
        var max = _.maxBy(children, '_maxDepth')._maxDepth;
        predicate._maxDepth = max;
        var keys = children.map(function(c){
            return c._childKeys;
        });
        keys = _.intersection(keys);
        if (keys.length == 1) {
            predicate._childKeys = keys[0];
        } else {
            predicate._childKeys = 'MIXED';
        }
    }
    
    predicate.depth = depth;
    return predicate;
}

function istype(type) {
    return function(e){
        return e.type === type;
    }
}
function addSyntheticTypes(predicate) {
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else if ( predicate.type == 'and' && 
                intervalTypes.indexOf(predicate._childKeys)>=0 && 
                predicate.predicates.length == 2 &&
                predicate.predicates.find(istype('greaterThanOrEquals')) && 
                predicate.predicates.find(istype('lessThanOrEquals'))
                )
    {
        var gt = predicate.predicates.find(istype('greaterThanOrEquals')),
            lt = predicate.predicates.find(istype('lessThanOrEquals'));
        predicate.type = 'between';
        predicate.predicates = undefined;
        predicate.key = predicate._childKeys;
        if (predicate._maxDepth) predicate._maxDepth--;
        predicate.value = gt.value + ',' + lt.value;
        predicate.from = gt.value;
        predicate.to = lt.value;
    } else if (predicate.predicate) {
        addSyntheticTypes(predicate.predicate);
    } else if(predicate.predicates) {
        predicate.predicates.forEach(function(p){
            addSyntheticTypes(p);
        });
    }
}

function flattenSameType(predicate) {
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else if (predicate.type == 'or' && predicate._childKeys !== 'MIXED') {
        //flatten
        predicate.type = 'in';
        predicate.key = predicate._childKeys;
        predicate.values = _.map(predicate.predicates, 'value');
        predicate._maxDepth--;
    } else if (predicate.predicate) {
        flattenSameType(predicate.predicate);
    } else if(predicate.predicates) {
        predicate.predicates.forEach(function(p){
            flattenSameType(p);
        });
    }
}

function getSimpleQuery(predicate) {
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else if(['or', 'not'].indexOf(predicate.type) !== -1 && predicate._maxDepth > 3) {
        return false;
    } else if(predicate.type === 'and') {
        var query = {};
        //validate that elements have different childkeys and none of them are MIXED and have OR or leaf type
        var invalidPredicate = _.find(predicate.predicates, function(p){
            return p.type == 'and' || p.type == 'not' || p._childKeys == 'MIXED'; //only leafs and OR queries of a single TYPE allowed
        });
        if (invalidPredicate) {
            return false;
        }
    }
    //serialize query to occurrence site search string
    var queryString = _.join(_.flattenDeep(attachPredicatesAsParams(predicate)), '&');
    return queryString;
}

function attachPredicatesAsParams(predicate) {
    let queryList = [];
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else if (predicate.predicate){
        queryList.push(attachPredicatesAsParams(predicate.predicate));
    } else if(predicate.predicates) {
        let queries = predicate.predicates.map(function(p){
            return attachPredicatesAsParams(p);
        });
        queryList.push(queries);
    } else {
        if (!_.isUndefined(predicate.key) && !_.isUndefined(predicate.value)) {
            let val = predicate.value;
            if (predicate.type === 'greaterThanOrEquals') {
                val += ',*';
            }
            if (predicate.type === 'lessThanOrEquals') {
                val = '*,' + val;
            }
            queryList.push(predicate.key.toLowerCase() + '=' + encodeURIComponent(val));
        } if (!_.isUndefined(predicate.geometry)) {
            queryList.push('geometry=' + encodeURIComponent(predicate.geometry));
        }
    }
    return queryList;
}

//returns a list of tasks to be run by async. Each task will add the looked up value to the predicate. Predicate with taxonKey will for example be attached the coresponding species
function addpredicateResolveTasks(predicate, config, tasks, __mf) {
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else {
        let camelKey = camelCase(_.get(predicate, 'key', ''));
        let keyResolver = config[camelKey];
        if (keyResolver) {
            if (keyResolver.type == 'ENDPOINT') {
                //create task
                addEndpointTask(predicate, keyResolver, tasks);
            } else if(keyResolver.type == 'ENUM') {
                resolveEnum(predicate, keyResolver, __mf);
            }
        }

        if (predicate.predicates) {
            predicate.predicates.forEach(function(p){
                addpredicateResolveTasks(p, config, tasks, __mf);
            });
        }
        if (predicate.predicate) {
            addpredicateResolveTasks(predicate.predicate, config, tasks, __mf);
        }
    }
    return tasks;
}

//given a predicate and a resolver configuration then translate the enum into something readable. fx "above 500 meters"
function resolveEnum(predicate, config, __mf) {
    if (intervalTypes.indexOf(predicate.key) !== -1 ) {
        if (predicate.type == 'between') {
            predicate.value = __mf(config.valueTranslation + predicate.type, {from: predicate.from, to: predicate.to})
        } else {
            predicate.value = __mf(config.valueTranslation + predicate.type, {from: predicate.value, to: predicate.value})
        }
    } else if (predicate.type == 'in') {
        predicate.values = predicate.values.map(function(e){
            return __mf(config.valueTranslation + e)
        });
    } else {
        predicate.value = __mf(config.valueTranslation + predicate.value)
    }
}

function addEndpointTask(predicate, config, tasks) {
    if (predicate.type == 'in') {
        
        let listPromise = Promise.all(predicate.values.map(function(value){
            return getResource(config.url + value);
        })).then(function(values){
            predicate.values = _.map(values, config.field);
        });
        tasks.push(listPromise);
    } else {
        let itemPromise = getResource(config.url + predicate.value).then(function(e){
            predicate.value = e[config.field];
        });
        tasks.push(itemPromise);
    }
}

function getResource(url) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(url, function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(err);
        }
    }, {retries: 3, timeoutMilliSeconds: 30000});
    return deferred.promise;
}
