"use strict";

var chai = require('chai'),
    expect = chai.expect,
    querystring = require('querystring'),
    request = require('requestretry'),
    randomWords = require('random-words'),
    severity = require('./severity').severity,
    userAgent = require('../../../../config/config').userAgent,
    Q = require('q'),
    _ = require('lodash'),
    unknownError = {
        message: 'Unknown error calling endpoint',
        type: 'STATUS',
        severity: severity.CRITICAL
    };

module.exports = {fromConfig, check};

function fromConfig(config) {
    return {
        start: function (cb) {
            check(config).then(function(e){
                cb(e);
            }).catch(function(err){
                cb();
            });
        },
        component: config.component || 'OTHER'
    }
}

function check(config) {
    //check that the configuration is correct
    config.severity = config.severity || severity.CRITICAL;
    expect(config.url, 'Missing URL in request').to.be.a('string');
    expect(config.component, 'Missing component').to.be.a('string');

    //configure the request
    var options = {};
    options.method = config.method || 'GET';
    options.json = config.json || true;
    options.url = config.url;
    options.userAgent = 'GBIF_WEBSITE';
    options.maxAttempts = 1;
    options.timeout = 60000;
    if (config.type == 'MAX_RESPONSE_TIME') {
        options.timeout = config.val + 500;
        options.maxAttempts = 1;
    }

    if (config.randomWord) {
        options.url = config.url.replace('{RANDOM_WORD}', randomWords());
    }
    if (config.secondsAgo) {
        options.url = config.url.replace('{SECONDS_AGO}', Date.now() - config.secondsAgo*1000);
    }

    var deferred = Q.defer();
    var start = new Date(); // process.hrtime() would be more precise for timing but that doesn't work in the client (in case we want this running there as well)
    request(options, function (err, response) {
        var elapsed = new Date() - start;
        if (err) {
            if (err.code == 'ESOCKETTIMEDOUT') {
                deferred.resolve({
                    message: config.message,
                    severity: config.severity,
                    component: config.component,
                    test: config
                });
            } else {
                console.log(err);
                console.log(response);
                console.log(config);
                deferred.resolve({
                    message: err.message,
                    severity: severity.OPERATIONAL,
                    component: config.component,
                    test: config
                });
            }
        } else {
            deferred.resolve(testExpectation(response, elapsed, config));
        }
    });
    return deferred.promise;
}

function testExpectation(response, elapsed, test) {
    try {
        if (test.type !== 'STATUS' && response.statusCode !== 200) {
            return {
                message: 'Unexpected status code url: ' + test.url,
                severity: severity.CRITICAL,
                component: test.component,
                test: test
            }
        }
        switch (test.type) {
            case 'STATUS':
                expect(response.statusCode, test.message || 'Unexpected status code').to.equal(test.val);
                break;
            case 'MAX_RESPONSE_TIME':
                expect(elapsed, test.message || 'Response too slow').to.be.below(test.val);
                break;
            case 'HAVE_PROPERTY':
                expect(response.body, test.message || 'Missing JSON property').to.have.nested.property(test.key);
                break;
            case 'HAVE_VALUE':
                expect(_.get(response, 'body.' + test.key), test.message || 'Wrong value for key').to.equal(test.val);
                break;
            case 'NUMBER_ABOVE':
                expect(_.get(response, 'body.' + test.key), test.message || 'Wrong count').to.be.above(test.val);
                break;
            case 'NUMBER_BELOW':
                expect(_.get(response, 'body.' + test.key), test.message || 'Wrong count').to.be.below(test.val);
                break;
            case 'CONTAIN':
                expect(JSON.stringify(response.body), test.message || 'Expected string').to.have.string(test.val);
                break;
            default:
                break;
        }
        return {
            severity: severity.OPERATIONAL,
            component: test.component,
            test: test
        }
    } catch (err) {
        return {
            message: test.message || `Failed test. Type: ${test.type} - key: ${test.key} - val: ${test.val}`,
            //details: err.message.substr(0, 300),
            severity: test.severity,
            component: test.component,
            test: test
        }
    }
}