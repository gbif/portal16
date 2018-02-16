'use strict';

let endpointTest = require('./endpointTest'),
    severity = require('./severity').severity,
    severityMap = require('./severity').severityMap,
    _ = require('lodash'),
    getMostSevere = require('./severity').getMostSevere,
    contentfulTest = require('./contentfulTest'),
    async = require('async');

module.exports = {start, startCustom, severity, severityMap};

function start(config, done, progress, failed) {
    let tests = createTests(config);
    tests.push(contentfulTest);
    startCustom(tests, done, progress, failed);
}

function updateProgress(progress, data) {
    if (typeof progress == 'function') {
        progress(data);
    }
}

function startCustom(tests, done, progress, failed) {
    let componentCounts = {};
    let results = [];

    tests.forEach(function(t) {
        let c = t.component ||'OTHER';
        componentCounts[c] = componentCounts[c] ? componentCounts[c] + 1 : 1;
    });

    // monitor progress
    let intervalUpdate = setInterval(function() {
        let summary = createSummary(results, componentCounts);
        updateProgress(progress, summary);
    }, 1000);

    // run all tests
    async.each(tests, function(test, callback) {
        test.start(function(result) {
            results.push(result);
            callback();
        });
    }, function(err) {
        clearInterval(intervalUpdate);
        // if any of the file processing produced an error, err would equal that error
        if (err) {
            failed(err);
        } else {
            let summary = createSummary(results, componentCounts);
            done(summary);
        }
    });

    // report initial state
    let summary = createSummary(results, componentCounts);
    updateProgress(progress, summary);
}

function createTests(config) {
    // map config to runnable tests
    let tests = config.map(function(c) {
        return endpointTest.fromConfig(c);
    });
    return tests;
}

function createSummary(results, componentCounts) {
    let componentMap = {};
    let resultCounts = {};
    let worstSeverity = 'OPERATIONAL';
    results.forEach(function(e) {
        let c = e.component || 'OTHER';
        resultCounts[c] = resultCounts[c] ? resultCounts[c] + 1 : 1;
        componentMap[c] = componentMap[c] || {severity: 'OPERATIONAL'};
        componentMap[c].severity = getMostSevere(componentMap[c].severity, e.severity);// severityMap[componentMap[c].severity] >= severityMap[e.severity] ? componentMap[c].severity : e.severity;
        worstSeverity = getMostSevere(worstSeverity, e.severity);// severityMap[worstSeverity] >= severityMap[e.severity] ? worstSeverity : e.severity;

        if (e.severity !== 'OPERATIONAL') {
            componentMap[c].errors = componentMap[c].errors ||[];
            componentMap[c].errors.push({
                message: e.message
            });
        }

        componentMap[c].pending = resultCounts[c] < componentCounts[c];
    });

    let healthComponentsOrder = ['OCCURRENCE', 'SPECIES', 'REGISTRY', 'IDENTITY', 'MAPS', 'DOWNLOAD', 'CRAWLER', 'RESOURCE_SEARCH', 'GITHUB', 'CONTENTFUL', 'IMAGE_CACHE'];
    let components = [];
    Object.keys(componentMap).forEach(function(key) {
        let c = componentMap[key];
        c.component = key;
        components.push(c);
    });
    components = _.sortBy(components, function(o) {
        return healthComponentsOrder.indexOf(o.component);
    });
    return {components: components, severity: worstSeverity};
}
