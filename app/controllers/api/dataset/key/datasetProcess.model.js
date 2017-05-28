"use strict";
var express = require('express'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
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
    let limit = 500;
    let attempts = await getProcess(key, {limit: 500});
    let summary = {
        lastAttempt: undefined,
        lastSuccess: undefined,
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
        if (attempt.finishReason) {
            summary.stats[attempt.finishReason] = summary.stats[attempt.finishReason] ? summary.stats[attempt.finishReason] + 1 : 1;
            summary.finished++;
        } else {
            summary.unfinished++;
        }
    });

    return summary;
}

module.exports = {
    getProcessSummary: getProcessSummary,
    getProcess: getProcess
};
