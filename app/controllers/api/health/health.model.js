"use strict";

var endpointTest = require('./endpointTest'),
    severity = require('./severity').severity,
    severityMap = require('./severity').severityMap,
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
    var worstStatus = 'OPERATIONAL';
    results.forEach(function (e) {
        var c = e.component || 'OTHER';
        resultCounts[c] = resultCounts[c] ? resultCounts[c] + 1 : 1;
        componentMap[c] = componentMap[c] || {status: 'OPERATIONAL'};
        componentMap[c].status = severityMap[componentMap[c].status] >= severityMap[e.status] ? componentMap[c].status : e.status;
        worstStatus = severityMap[worstStatus] >= severityMap[e.status] ? worstStatus : e.status;

        if (e.status !== 'OPERATIONAL') {
            componentMap[c].errors = componentMap[c].errors ||[];
            componentMap[c].errors.push({
                message: e.message,
                details: e.details
            });
        }

        componentMap[c].pending = resultCounts[c] < componentCounts[c];
    });
    return {components: componentMap, status: worstStatus};
}

//var tests = require('./tests');
//function done(summary) {
//    console.log('done');
//    console.log(summary);
//}
//function progress(summary) {
//    console.log('progress');
//    console.log(summary);
//}
//function failed(summary) {
//    console.log('failed');
//    console.log(summary);
//}
//start(tests, done, progress, failed);




/*
 2 version
 * all tests completed (used for p16 to judge if we want to show a notification)
 * as tests results come in a method is called with updates
 they are really just wrappers of the same

 summary in the end
 status for each API with a status message, time, [test results] (so that one can see details about what failed/was tested for)

 Health.getStatus(done, updates, failed) //failed meaning that the Health code failed. done returns summary. updates returns summary intermediate states

 status can be: testing, operational, operational but slow, failed

 testing: is when the tests are still running (and none has failed)
 operational: all good
 operational but slow: all good, but response time slower than expected
 unstable: required retries to get the data (added by a wrapper that keeps track of history - could be more complex than just retries needed, but offline every 5 minutes)
 failed: wrong status code, offline or wrong content

 each component (API endpoint or site) test is composed of multiple tests. tests are atomic and can be each of the states (operational, slow, unstable, failed)
 //p16 or status api could keep track of previous attempts and label APIs as unstable based on how often they fail

 p16 would require services to fail more than once to notify the users

 individual test results
 test config, resulting status, message (from test config), detailed message (from running test), component name

 ----


 runTest(config)
 test config
 create and execute request
 analyse result
 return result

 run(config, updateCb)
 runAllTests(transformConifgToTests, updateCb)

 runCustom(customTests, updateCb) {
 transformConifgToTests()
 tests = concat with custom tests

 for all tests do:
 runTest().then(updateCb with tmp summary)
 .whenAllCompleted(create summary and return it)
 }

 transformConifgToTests
 make config into runnable tests

 add custom test. interface: start -> returns promise and specific resolve format (component, time, status, message, details, test description). only throw if all tests should fail.
 custom tests could fx be

 createSummary([testResults])
 map test results to their component type.
 isRunning
 count how many tests are pending
 if failed, then label as such else testing
 label by most severe
 timestamp,
 message

 requestLib should work  in client as well.
 perhaps do a wrapper just to make sure.
 */