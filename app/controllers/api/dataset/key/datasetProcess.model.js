"use strict";
var apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    _ = require('lodash'),
    request = require('requestretry');

async function getProcess(key, query) {
    let baseRequest = {
        url: apiConfig.dataset.url + key + '/process?' + querystring.stringify(query),
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let response = await request(baseRequest);
    if (response.statusCode > 299) {
        throw response;
    }
    let process = response.body;
    return process;
}

async function getProcessSummary(key) {
    let limit = 2000;
    let attempts = await getProcess(key, {limit: limit});
    let summary = {
        lastAttempt: undefined,
        lastSuccess: undefined,
        lastNormal: undefined,
        failuresSinceLastSuccess: 0,
        stats: {
            NORMAL: undefined,
            NOT_MODIFIED: undefined,
            ABORT: undefined,
            OTHER: undefined
        },
        finished: 0,
        unfinished: 0,
        analyzedCount: Math.min(limit, attempts.count)
    };

    attempts.results.forEach(function(attempt){
        if (!summary.lastAttempt && attempt.finishReason) {
            summary.lastAttempt = attempt;
        }
        if (!summary.lastSuccess) {
            if (attempt.finishReason == 'NORMAL' || attempt.finishReason == 'NOT_MODIFIED') {
                summary.lastSuccess = attempt;
            } else if(attempt.finishReason) {
                summary.failuresSinceLastSuccess++;
            }
        }
        if (!summary.lastNormal) {
            if (attempt.finishReason == 'NORMAL') {
                summary.lastNormal = attempt;
            }
        }
        if (attempt.finishReason) {
            summary.stats[attempt.finishReason] = summary.stats[attempt.finishReason] ? summary.stats[attempt.finishReason] + 1 : 1;
            summary.finished++;
        } else if(attempt.startedCrawling && !attempt.finishedCrawling) {
            summary.unfinished++;
        }
    });

    return summary;
}

async function getCrawling() {
    let baseRequest = {
        url: apiConfig.crawlingDatasetProcessRunning.url + '?t=' + Date.now(),
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let response = await request(baseRequest);
    if (response.statusCode > 299) {
        throw response;
    }
    let process = response.body;
    return process;
}

async function isDatasetBeingCrawled(key) {
    let crawls = await getCrawling();
    if (_.isArray(crawls)) {
        let ongoingCrawl = _.find(crawls, function (e) {
            return e && e.datasetKey == key && !e.finishedCrawling
        });
        return ongoingCrawl;
    } else {
        console.log('crawler endpoint returns something that is not an array');//TODO put in logs.
        return;
    }
}

module.exports = {
    getProcessSummary: getProcessSummary,
    getProcess: getProcess,
    getCrawling: getCrawling,
    isDatasetBeingCrawled: isDatasetBeingCrawled
};
