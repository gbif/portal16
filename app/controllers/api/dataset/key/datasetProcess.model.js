'use strict';
let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    authOperations = require('../../../auth/gbifAuthRequest'),
    _ = require('lodash'),
    request = rootRequire('app/helpers/request');

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
        lastDataChange: undefined,
        failuresSinceLastSuccess: 0,
        stats: {
            NORMAL: undefined,
            NOT_MODIFIED: undefined,
            ABORT: undefined,
            OTHER: undefined
        },
        finished: 0,
        unfinished: 0,
        notStarted: 0,
        analyzedCount: Math.min(limit, attempts.count),
        recent: []
    };

    attempts.results.forEach(function(attempt) {
        if (summary.recent.length < 25 && attempt.finishReason) {
            summary.recent.push({
                finishReason: attempt.finishReason,
                startedCrawling: attempt.startedCrawling
            });
        }
        if (!summary.lastAttempt && attempt.finishReason) {
            summary.lastAttempt = attempt;
        }
        if (!summary.lastSuccess) {
            if (attempt.finishReason == 'NORMAL' || attempt.finishReason == 'NOT_MODIFIED') {
                summary.lastSuccess = attempt;
            } else if (attempt.finishReason) {
                summary.failuresSinceLastSuccess++;
            }
        }
        if (!summary.lastNormal) {
            if (attempt.finishReason == 'NORMAL') {
                summary.lastNormal = attempt;
            }
        }
        if (!summary.lastDataChange) {
            if (attempt.rawOccurrencesPersistedNew > 0 || attempt.rawOccurrencesPersistedUpdated > 0) {
                summary.lastDataChange = attempt;
            }
        }
        if (attempt.finishReason) {
            summary.stats[attempt.finishReason] = summary.stats[attempt.finishReason] ? summary.stats[attempt.finishReason] + 1 : 1;
            summary.finished++;
        } else if (attempt.startedCrawling && !attempt.finishedCrawling) {
            summary.unfinished++;
        } else {
            summary.notStarted++;
        }
    });

    return summary;
}

async function getCrawling() {
    let baseRequest = {
        url: apiConfig.crawlingDatasetProcessRunning.url + '?t=' + Date.now(),
        method: 'GET',
        maxAttempts: 2,
        retryDelay: 3000,
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

async function startCrawling(key) {
    /*
     The GBIF Authentication scheme allows us to auhtorise as a trusted app,
     but the server side component (https://github.com/gbif/gbif-common-ws/blob/master/src/main/java/org/gbif/ws/security/GbifAuthService.java)
     does not allow us to have REGISTRY_ADMIN permission.  Here we work around that limitation by brokering on behalf of the "ADMIN user" who has such permission.
     This is not ideal, but considered a reasonable workaround to avoid introducing role based permission to trusted apps.
     */
    let options = {
        method: 'POST',
        url: apiConfig.dataset.url + key + '/crawl',
        canonicalPath: apiConfig.dataset.canonical + '/' + key + '/crawl',
        userName: 'admin', // the registry crawl endpoint do not accept trusted apps to crawl, it has to be a user, so hence the hardcoded admin user
        body: {}
    };

    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 204) {
        throw response;
    }
    return response;
}

async function crawlStatus(key) {
    let crawls = await getCrawling();
    if (_.isArray(crawls)) {
        let crawlInProcess = _.find(crawls, function(e) {
            return e && e.datasetKey == key && !e.finishedCrawling;
        });
        let isInQueue = _.find(crawls, function(e) {
            return e && e.datasetKey == key;
        });
        return {
            queueLength: crawls.length,
            isInQueue: !!isInQueue,
            crawlInProcess: crawlInProcess
        };
    } else {
        console.log('crawler endpoint returns something that is not an array');// TODO put in logs.
        return;
    }
}

module.exports = {
    getProcessSummary: getProcessSummary,
    getProcess: getProcess,
    getCrawling: getCrawling,
    startCrawling: startCrawling,
    crawlStatus: crawlStatus
};
