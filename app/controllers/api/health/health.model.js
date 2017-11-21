"use strict";

var endpointTest = require('./endpointTest'),
    severity = require('./severity').severity,
    severityMap = require('./severity').severityMap,
    _ = require('lodash'),
    getMostSevere = require('./severity').getMostSevere,
    async = require('async');

module.exports = {start, startCustom, severity, severityMap};

function start(config, done, progress, failed) {
    var tests = createTests(config);
    startCustom(tests, done, progress, failed);
}

function updateProgress(progress, data) {
    if (typeof progress == 'function') {
        progress(data);
    }
}

function startCustom(tests, done, progress, failed) {
    var componentCounts = {};
    var results = [];

    tests.forEach(function (t) {
        var c = t.component ||'OTHER';
        componentCounts[c] = componentCounts[c] ? componentCounts[c] + 1 : 1
    });

    //monitor progress
    var intervalUpdate = setInterval(function () {
        var summary = createSummary(results, componentCounts);
        updateProgress(progress, summary);
    }, 1000);

    //run all tests
    async.each(tests, function (test, callback) {
        test.start(function (result) {
            results.push(result);
            callback();
        });
    }, function (err) {
        clearInterval(intervalUpdate);
        // if any of the file processing produced an error, err would equal that error
        if (err) {
            failed(err);
        } else {
            var summary = createSummary(results, componentCounts);
            done(summary);
        }
    });

    //report initial state
    var summary = createSummary(results, componentCounts);
    updateProgress(progress, summary);
}

function createTests(config) {
    //map config to runnable tests
    var tests = config.map(function (c) {
        return endpointTest.fromConfig(c);
    });
    return tests;
}

function createSummary(results, componentCounts) {
    var componentMap = {};
    var resultCounts = {};
    var worstSeverity = 'OPERATIONAL';
    results.forEach(function (e) {
        var c = e.component || 'OTHER';
        resultCounts[c] = resultCounts[c] ? resultCounts[c] + 1 : 1;
        componentMap[c] = componentMap[c] || {severity: 'OPERATIONAL'};
        componentMap[c].severity = getMostSevere(componentMap[c].severity, e.severity);//severityMap[componentMap[c].severity] >= severityMap[e.severity] ? componentMap[c].severity : e.severity;
        worstSeverity = getMostSevere(worstSeverity, e.severity);//severityMap[worstSeverity] >= severityMap[e.severity] ? worstSeverity : e.severity;

        if (e.severity !== 'OPERATIONAL') {
            componentMap[c].errors = componentMap[c].errors ||[];
            componentMap[c].errors.push({
                message: e.message
            });
        }

        componentMap[c].pending = resultCounts[c] < componentCounts[c];
    });

    let healthComponentsOrder = ['OCCURRENCE', 'SPECIES', 'REGISTRY', 'MAPS', 'DOWNLOAD', 'CRAWLER', 'RESOURCE_SEARCH', 'GITHUB', 'CONTENTFUL'];
    let components = [];
    Object.keys(componentMap).forEach(function(key){
        var c = componentMap[key];
        c.component = key;
        components.push(c);
    });
    components = _.sortBy(components, function(o){
        return healthComponentsOrder.indexOf(o.component);
    });
    return {components: components, severity: worstSeverity};
}