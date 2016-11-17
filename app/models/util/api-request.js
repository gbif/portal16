var request = require('request'),
    async = require('async'),
    xmlParser = require('xml2js').parseString,
    log = require('../../../config/log');

var ERRORS = Object.freeze({
    API_TIMEOUT: 'API_TIMEOUT',
    API_ERROR: 'API_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    INVALID_RESPONSE: 'INVALID_RESPONSE'
});

function getData(cb, path, options) {
    var requestOptions = {
        url: path,
        timeout: options.timeoutMilliSeconds
    };

    if (options.headers) requestOptions.headers = options.headers;

    request.get(requestOptions, function (err, response, body) {
        // if timeout
        if (err) {
            if (err.code === 'ETIMEDOUT') {
                cb(ERRORS.API_TIMEOUT, null);
                log.error('timed out while connecting to ' + path);
            } else if (err.connect === true) {
                cb(ERRORS.API_TIMEOUT, null);
                log.error('timed out getting data from ' + path);
            } else {
                cb(ERRORS.API_ERROR, null);
                log.error('error while talking to ' + path + ' ' + err);
            }
        }
        //if not found or not status code 200
        else if (response && response.statusCode !== 200) {
            switch (response.statusCode) {
                case 404:
                    cb(ERRORS.NOT_FOUND, null);
                    log.error('got 404 ' + path); //TODO might be okay dependent on caller context
                    break;
                case 401:
                    cb('UNAUTHORIZED', null);
                    log.error('got 401 ' + path); //TODO might be okay dependent on caller context
                    break;
                default:
                    cb(ERRORS.INVALID_RESPONSE, null);
                    log.error('didnt get status code 200, but ' + response.statusCode + ' from ' + path);
                    break;
            }
        }

        //if no response data
        else if (!body) {
            cb(ERRORS.INVALID_RESPONSE, null);
            log.error('no response data ' + path);
        }
        else {
            if (options.type == 'XML') {
                parseXml(body, path, cb);
            }
            else {
                parseJson(body, path, cb);
            }
        }
    });
}

function parseXml(body, path, cb) {
    "use strict";
    try {
        xmlParser(body, function (err, result) {
            if (err) {
                cb(err);
                log.error('failed to parse XML response ' + path);
            }
            else {
                cb(null, result);
            }
        });
    } catch (err) {
        //if invalid response
        cb(ERRORS.INVALID_RESPONSE, null);
        log.error('invalid xml response ' + path);
    }
}

function parseJson(body, path, cb) {
    "use strict";
    let data;
    try {
        data = JSON.parse(body);
        cb(null, data);
    } catch (err) {
        //if invalid response
        cb(ERRORS.INVALID_RESPONSE, null);
        console.log(err);
        log.error('invalid json response ' + path);
    }
}

function getApiData(path, callback, options) {
    options = options || {};
    options.timeoutMilliSeconds = options.timeoutMilliSeconds || 3000;
    options.retries = options.retries || 2;
    options.failHard = options.failHard || false;

    async.retry(
        {times: options.retries, interval: 200},
        function (cb) {
            getData(cb, path, options);
        },
        function (err, result) {
            if (err) {
                //failed after all attempts
                //if fail hard, then return explicit error. This will break async requests
                //else return result marked as error
                if (options.failHard) {
                    callback(err, null);
                } else {
                    callback(null, {
                        errorType: err
                    });
                }
            } else {
                //got useful response back
                callback(null, result);
            }
        }
    );
}

module.exports = {
    getApiData: getApiData,
    ERRORS: ERRORS
};
