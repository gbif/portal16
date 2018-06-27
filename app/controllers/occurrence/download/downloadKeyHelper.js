'use strict';
let _ = require('lodash'),
    camelCase = require('camelcase'),
    Q = require('q'),
    request = require('requestretry'),
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    authOperations = require('../../auth/gbifAuthRequest'),
    helper = rootRequire('app/models/util/util'),
    intervalTypes = ['YEAR', 'EVENT_DATE', 'ELEVATION', 'DEPTH'];

/**
 * Add key describing the type of children. If they are all predicates with the same key, the parent will get eg. prop _childKeys = '[MONTH]'. if different then _childKeys = 'MIXED'
 * will also add depth in tree and max depth of children
 * @param predicate
 * @param depth
 * @return {*}
 */
function addChildKeys(predicate) {
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else if (!predicate.predicates && !predicate.predicate) {
        if (predicate.type == 'within') {
            predicate.key = 'GEOMETRY';
            predicate.value = predicate.geometry;
        }
        if (predicate.type == 'isNotNull') {
            predicate.key = predicate.parameter;
        }
        predicate._childKeys = predicate.key;
    } else if (predicate.predicate) {
        let child = addChildKeys(predicate.predicate);
        predicate._childKeys = child._childKeys;
    } else {
        let children = predicate.predicates.map(function(p) {
            return addChildKeys(p);
        });
        let keys = children.map(function(c) {
            return c._childKeys;
        });
        keys = _.intersection(keys);
        if (keys.length == 1) {
            predicate._childKeys = keys[0];
        } else {
            predicate._childKeys = 'MIXED';
        }
    }
    return predicate;
}

function setDepths(predicate, depth) {
    depth = depth || 0;
    depth++;
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else if (!predicate.predicates && !predicate.predicate) {
        predicate._maxDepth = depth;
    } else if (predicate.predicate) {
        let child = setDepths(predicate.predicate, depth);
        predicate._maxDepth = Math.max(child._maxDepth, predicate._maxDepth || 0);
    } else {
        let children = predicate.predicates.map(function(p) {
            return setDepths(p, depth);
        });
        let max = _.maxBy(children, '_maxDepth')._maxDepth;
        predicate._maxDepth = max;
    }

    predicate.depth = depth;
    return predicate;
}

/** *
 * if an OR predicate and all child predicates are of the same type, then flatten to IN type
 * @param predicate
 */
function flattenSameType(predicate) {
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else if (predicate.type == 'or' && predicate._childKeys !== 'MIXED' && predicate.depth + 1 === predicate._maxDepth) {
        // flatten
        predicate.type = 'in';
        predicate.key = predicate._childKeys;
        predicate.values = _.map(predicate.predicates, 'value');
        predicate._maxDepth--;
    } else if (predicate.predicate) {
        flattenSameType(predicate.predicate);
    } else if (predicate.predicates) {
        predicate.predicates.forEach(function(p) {
            flattenSameType(p);
        });
    }
}


function istype(type) {
    return function(e) {
        return e.type === type;
    };
}
function addSyntheticTypes(predicate) {
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else if ( predicate.type == 'and' &&
        intervalTypes.indexOf(predicate._childKeys) >= 0 &&
        predicate.predicates.length == 2 &&
        predicate.predicates.find(istype('greaterThanOrEquals')) &&
        predicate.predicates.find(istype('lessThanOrEquals'))
    ) {
        let gt = predicate.predicates.find(istype('greaterThanOrEquals')),
            lt = predicate.predicates.find(istype('lessThanOrEquals'));
        predicate.type = 'between';
        predicate.predicates = undefined;
        predicate.key = predicate._childKeys;
        if (predicate._maxDepth) predicate._maxDepth = predicate._maxDepth - 1;
        predicate.value = gt.value + ',' + lt.value;
        predicate.from = gt.value;
        predicate.to = lt.value;
    } else if (predicate.predicate) {
        addSyntheticTypes(predicate.predicate);
    } else if (predicate.predicates) {
        predicate.predicates.forEach(function(p) {
            addSyntheticTypes(p);
        });
    }
}

function getSimpleQuery(predicate) {
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else if (['or', 'not'].indexOf(predicate.type) !== -1 || predicate._maxDepth > 3) {
        return false;
    } else if (predicate.type === 'and') {
        // validate that elements have different childkeys and none of them are MIXED and have OR or leaf type
        let invalidPredicate = _.find(predicate.predicates, function(p) {
            return p.type == 'and' || p.type == 'not' || p._childKeys == 'MIXED'; // only leafs and OR queries of a single TYPE allowed
        });
        if (invalidPredicate) {
            return false;
        }
    }
    // serialize query to occurrence site search string
    let queryString = _.join(_.flattenDeep(attachPredicatesAsParams(predicate)), '&');
    return queryString;
}

function attachPredicatesAsParams(predicate) {
    let queryList = [];
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else if (predicate.predicate) {
        queryList.push(attachPredicatesAsParams(predicate.predicate));
    } else if (predicate.predicates) {
        let queries = predicate.predicates.map(function(p) {
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
        } else if (!_.isUndefined(predicate.geometry)) {
            queryList.push('geometry=' + encodeURIComponent(predicate.geometry));
        }
    }
    return queryList;
}

// returns a list of tasks to be run by async. Each task will add the looked up value to the predicate. Predicate with taxonKey will for example be attached the coresponding species
function addpredicateResolveTasks(predicate, config, tasks, __mf) {
    if (!predicate) {
        throw new Error('failed to parse predicate');
    } else {
        let camelKey = camelCase(_.get(predicate, 'key', ''));
        let keyResolver = config[camelKey];
        if (keyResolver) {
            if (keyResolver.type == 'ENDPOINT') {
                // create task
                addEndpointTask(predicate, keyResolver, tasks);
            } else if (keyResolver.type == 'ENUM') {
                resolveEnum(predicate, keyResolver, __mf);
            }
        }

        if (predicate.predicates) {
            predicate.predicates.forEach(function(p) {
                addpredicateResolveTasks(p, config, tasks, __mf);
            });
        }
        if (predicate.predicate) {
            addpredicateResolveTasks(predicate.predicate, config, tasks, __mf);
        }
    }
    return tasks;
}

// given a predicate and a resolver configuration then translate the enum into something readable. fx "above 500 meters"
function resolveEnum(predicate, config, __mf) {
    if (intervalTypes.indexOf(predicate.key) !== -1 ) {
        if (predicate.type == 'between') {
            predicate.value = __mf(config.valueTranslation + predicate.type, {from: predicate.from, to: predicate.to});
        } else if (predicate.type == 'lessThan') {
            predicate.value = __mf(config.valueTranslation + 'lessThanOrEquals', {to: predicate.value});
        } else if (predicate.type == 'greaterThan') {
            predicate.value = __mf(config.valueTranslation + 'greaterThanOrEquals', {from: predicate.value});
        } else {
            predicate.value = __mf(config.valueTranslation + predicate.type, {from: predicate.value, to: predicate.value});
        }
    } else if (predicate.type == 'isNotNull') {
        predicate.value = 'isNotNull';
    } else if (predicate.type == 'in') {
        predicate.values = predicate.values.map(function(e) {
            return __mf(config.valueTranslation + e);
        });
    } else {
        predicate.value = __mf(config.valueTranslation + predicate.value);
    }
}

function addEndpointTask(predicate, config, tasks) {
    if (predicate.type == 'in') {
        let listPromise = Promise.all(predicate.values.map(function(value) {
            return getResource(config.url + value);
        })).then(function(values) {
            predicate.values = _.map(values, config.field);
        })
        .catch(function() {
            predicate.values = [predicate.value];
        });
        tasks.push(listPromise);
    } else {
        let itemPromise = getResource(config.url + predicate.value).then(function(e) {
                predicate.value = e[config.field];
            })
            .catch(function() {
                predicate.value = predicate.value;
            });
        tasks.push(itemPromise);
    }
}

function getResource(url, failSilently) {
    let options = {
        url: url,
        retries: 3,
        timeout: 30000,
        failHard: !failSilently
    };
    return requestPromise(options);
}

function requestPromise(queryOptions) {
    let deferred = Q.defer();
    helper.getApiData(queryOptions.url, function(err, data) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(data);
        }
    }, queryOptions);
    return deferred.promise;
}

async function getDownload(key, username) {
    let options = {
        method: 'GET',
        url: apiConfig.occurrenceDownload.url + key,
        canonicalPath: apiConfig.occurrenceDownload.canonical,
        userName: username,
        json: true
    };

    let response;
    // if user is logged in then get as auth. Else just use unauthenticated API.
    if (username) {
        response = await authOperations.authenticatedRequest(options);
    } else {
        response = await request(options);
    }
    if (response.statusCode !== 200) {
        throw response;
    }

    return response.body;
}

async function deleteDownload(key, username) {
    let erasureDate = Date.now();
    let updatedDownload = await (setDownloadErasureDate(key, erasureDate, username));
    return updatedDownload;
}

async function postponeDeletion(key, username) {
    let futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 365);
    let updatedDownload = await (setDownloadErasureDate(key, futureDate, username));
    return updatedDownload;
}

async function setDownloadErasureDate(key, erasureDate, username) {
    let download = await getDownload(key, username);

    download.eraseAfter = erasureDate;
    let options = {
        method: 'PUT',
        body: download,
        url: apiConfig.occurrenceDownload.url + key,
        canonicalPath: apiConfig.occurrenceDownload.canonical,
        userName: username,
        json: true
    };

    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== '204') {
        throw response;
    }
}

module.exports = {
    addChildKeys: addChildKeys,
    flattenSameType: flattenSameType,
    addSyntheticTypes: addSyntheticTypes,
    getSimpleQuery: getSimpleQuery,
    addpredicateResolveTasks: addpredicateResolveTasks,
    getResource: getResource,
    setDepths: setDepths,
    getDownload: getDownload,
    deleteDownload: deleteDownload,
    postponeDeletion: postponeDeletion
};
