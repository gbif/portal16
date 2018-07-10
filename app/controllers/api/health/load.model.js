'use strict';

let _ = require('lodash'),
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    userAgent = require('../../../../config/config').userAgent,
    querystring = require('querystring'),
    request = require('requestretry');

module.exports = {
    start: function() {
        return start(testConfig);
    }
};

async function start(tests) {
    let results = await Promise.all(tests.map(function(test) {
        return test();
    }));
    return {
        components: _.keyBy(results, 'component')
    };
}

async function clusterLoad() {
    let options = {
        url: apiConfig.yarnResourceManager.url + 'cluster/scheduler?v=' + Date.now(),
        json: true,
        userAgent: userAgent
    };
    let response = await request(options);
    if (response.statusCode != 200) {
        return {
            component: 'CLUSTER',
            error: 'No response',
            severity: 'CRITICAL'
        };
    }
    let result = response.body;

    // calculate load as fraction of memory usage or core usage - whichever is higher
    let maxMemory = _.get(result, 'scheduler.schedulerInfo.rootQueue.maxResources.memory', 1);
    let maxCores = _.get(result, 'scheduler.schedulerInfo.rootQueue.maxResources.vCores', 1);

    let usedMemory = _.get(result, 'scheduler.schedulerInfo.rootQueue.usedResources.memory', 0);
    let usedCores = _.get(result, 'scheduler.schedulerInfo.rootQueue.usedResources.vCores', 0);

    let load = Math.max( (usedMemory / maxMemory), (usedCores / maxCores) );

    return {
        component: 'CLUSTER',
        load: load,
        severity: load > 0.90 ? 'WARNING' : 'OPERATIONAL'
    };
}

async function crawlerLoad() {
    let options = {
        url: apiConfig.crawlingDatasetProcessRunning.url + '?vLoad=' + Date.now(),
        json: true,
        userAgent: userAgent
    };
    let response = await request(options);
    if (response.statusCode != 200) {
        return {
            component: 'CRAWLER',
            error: 'No response',
            severity: 'CRITICAL'
        };
    }
    let result = response.body;
    return {
        component: 'CRAWLER',
        load: result.length,
        severity: result.total > 200 ? 'WARNING' : 'OPERATIONAL'
    };
}

async function downloadQueue() {
    let query = {
        timezone: 'GMT',
        filter: 'status=RUNNING',
        _dc: Date.now()
    };
    let options = {
        url: apiConfig.oozie.url + 'jobs?' + querystring.stringify(query),
        json: true,
        userAgent: userAgent
    };
    let response = await request(options);
    if (response.statusCode != 200) {
        return {
            component: 'DOWNLOAD',
            error: 'No response',
            severity: 'CRITICAL'
        };
    }
    let result = response.body;
    return {
        component: 'DOWNLOAD',
        load: result.total,
        severity: result.total > 200 ? 'WARNING' : 'OPERATIONAL'
    };
}

// tests are expected to return {component name, load?: [high, medium, low], values: {custom obj}}
let testConfig = [clusterLoad, crawlerLoad, downloadQueue];
