"use strict";

var chai = require('chai'),
    expect = chai.expect,
    querystring = require('querystring'),
    request = require('requestretry'),
    randomWords = require('random-words'),
    Q = require('q'),
    _ = require('lodash'),
    severity = {
        OK: 0,
        WARNING: 1,
        CRITICAL: 2
    },
    unknownError = {
        message: 'Unknown error calling endpoint',
        type: 'STATUS',
        status: severity.CRITICAL
    };

module.exports = {statusCheck, severity};


function check(config) {
    //check that the configuration is correct
    config.severity = config.severity || severity.CRITICAL;
    expect(config.url, 'Missing URL in request').to.be.a('string');
    expect(config.component, 'Missing component').to.be.a('string');
    expect(config.severity, 'Invalid severity').to.be.an('number');

    //configure the request
    var options = {};
    options.method = config.method || 'GET';
    options.json = config.json || true;
    options.url = config.url;
    options.maxAttempts = 2;
    options.retryDelay = 500;
    options.timeout = 30000;
    if (config.type == 'MAX_RESPONSE_TIME') {
        options.timeout = config.val + 500;
        options.maxAttempts = 1;
    }

    if (config.randomWord) {
        options.url = config.url.replace('RANDOM_WORD', randomWords());
    }

    var deferred = Q.defer();
    var start = new Date(); // process.hrtime() would be more precise for timing but that doesn't work in the client (in case we want this running there as well)
    request(options, function(err, response){
        var elapsed = new Date() - start;
        if (err) {
            if (err.code == 'ESOCKETTIMEDOUT') {
                deferred.resolve({
                    message: 'Response too slow : ' + elapsed,
                    status: config.severity,
                    component: config.component,
                    test: config
                });
            } else {
                deferred.resolve(unknownError);
            }
        }
        deferred.resolve(testExpectation(response, elapsed, config));
    });
    return deferred.promise;
}

function testExpectation(response, elapsed, test) {
    try {
        if (test.type !== 'STATUS' && response.statusCode !== 200) {
            return {
                message: 'Unexpected status code: expected 200 but got ' + response.statusCode,
                status: severity.CRITICAL,
                component: test.component,
                test: test
            }
        }
        switch (test.type) {
            case 'STATUS': expect(response.statusCode, test.message || 'Unexpected status code').to.equal(test.val);
                break;
            case 'MAX_RESPONSE_TIME': expect(elapsed, test.message || 'Response too slow').to.be.below(test.val);
                break;
            case 'HAVE_PROPERTY': expect(response.body, test.message || 'Missing JSON property').to.have.nested.property(test.key);
                break;
            case 'HAVE_VALUE': expect(_.get(response, 'body.' + test.key), test.message || 'Wrong value for key').to.equal(test.val);
                break;
            case 'NUMBER_ABOVE': expect(_.get(response, 'body.' + test.key), test.message || 'Wrong count').to.be.above(test.val);
                break;
            case 'NUMBER_BELOW': expect(_.get(response, 'body.' + test.key), test.message || 'Wrong count').to.be.below(test.val);
                break;
            case 'CONTAIN': expect(JSON.stringify(response.body), test.message || 'Expected string').to.have.string(test.val);
                break;
            default:
                break;
        }
        return {
            status: severity.OK,
            component: test.component,
            test: test
        }
    } catch(err) {
        return {
            message: err.message.substr(0,300),
            status: test.severity,
            component: test.component,
            test: test
        }
    }
}

function statusCheck(tests){
    var deferred = Q.defer();
    if (!_.isArray(tests)){
        tests = [tests];
    }
    Q.all(tests.map(function(t){return check(t);})).then(function(results){
        var summary = summarize(results);
        deferred.resolve({results, summary});
    }).catch(function(err){
        deferred.reject(err);
    });
    return deferred.promise;
}

function summarize(results){
    var componentMap = {};
    results.forEach(function(e){
        var c = e.component || 'OTHER';
        componentMap[c] = componentMap[c] || {status: severity.OK};
        if (componentMap[c].status < e.status) {
            componentMap[c] = e;
        }
    });
    return componentMap;
}

var tests = require('./tests');
statusCheck(tests).then(function (data) {
    console.log(data);
}).catch(function (err) {
    console.log(err)
});