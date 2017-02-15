var request = require('request'),
    async = require('async'),
    xmlParser = require('xml2js').parseString,
    isDevMode = require('../../../config/config').env == 'dev',
    log = require('../../../config/log'),
    Q = require('q');

var ERRORS = Object.freeze({
    API_TIMEOUT: 'API_TIMEOUT',
    NO_CONTENT: 'NO_CONTENT',
    API_ERROR: 'API_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INVALID_RESPONSE: 'INVALID_RESPONSE',
    BACKEND_FETCH_FAILED: 'BACKEND_FETCH_FAILED'
});

function getData(cb, path, options) {
    var requestOptions = {
        url: path,
        timeout: options.timeoutMilliSeconds
    };

    if (options.headers) requestOptions.headers = options.headers;
    if (options.qs) requestOptions.qs = options.qs;

    request.get(requestOptions, function (err, response, body) {
        // if timeout
        if (err) {
            if (err.code === 'ETIMEDOUT') {
                cb({
                    errorType: ERRORS.API_TIMEOUT,
                    errorResponse: err
                }, null);
                //log.error('timed out while connecting to ' + path);
            } else if (err.connect === true) {
                cb({
                    errorType: ERRORS.API_TIMEOUT,
                    errorResponse: err
                }, null);
                //log.error('timed out getting data from ' + path);
            } else {
                cb({
                    errorType: ERRORS.API_TIMEOUT,
                    errorResponse: err
                }, null);
                //log.error('error while talking to ' + path + ' ' + err);
            }
        }
        //if not found or not status code 200
        else if (response && response.statusCode !== 200) {
            let error = {
                errorResponse: response
            };
            switch (response.statusCode) {
                case 204:
                    error.errorType = ERRORS.NO_CONTENT;
                    break;
                case 400:
                    error.errorType = ERRORS.BAD_REQUEST;
                    break;
                case 404:
                    error.errorType = ERRORS.NOT_FOUND;
                    break;
                case 401:
                    error.errorType = ERRORS.UNAUTHORIZED;
                    break;
                case 503:
                    error.errorType = ERRORS.BACKEND_FETCH_FAILED;
                    log.error(response.statusCode + ' ' + path + ' ' + response.body);
                    break;
                default:
                    error.errorType = ERRORS.INVALID_RESPONSE;
                    log.error(response.statusCode + ' ' + path + ' ' + response.body);
                    break;
            }
            cb(error, null);
        }

        //if no response data
        else if (!body) {
            cb({
                errorType: ERRORS.INVALID_RESPONSE,
                errorResponse: err
            }, null);
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
        cb({
            errorType: ERRORS.INVALID_RESPONSE,
            errorResponse: err
        }, null);
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
        cb({
            errorType: ERRORS.INVALID_RESPONSE,
            errorResponse: err
        }, null);
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

                //log failed request if in development mode - otherwise leave it to the using function to decide if this is a problem. could well be a simple timeout or a wrong query
                if (isDevMode) {
                    log.error('api request failed at: ' + path, err.errorType);
                }
                if (options.failHard) {
                    callback(err, null);
                } else {
                    callback(null, err);
                }
            } else {
                //got useful response back
                callback(null, result);
            }
        }
    );
}

function getApiDataPromise(requestUrl, options) {
    let deferred = Q.defer();

    getApiData(requestUrl, function (err, data) {
        if (err) {
            let reason = err + ' while accessing ' + requestUrl;
            deferred.reject(new Error(reason));
            log.info(reason);
            return deferred.promise;
        }

        if (typeof data.errorType !== 'undefined') {
            let reason = data.errorType + ' while accessing ' + requestUrl;
            deferred.reject(new Error(reason));
            log.info(reason);
        } else if (data) {
            deferred.resolve(data);
        }
    }, options);

    return deferred.promise;
}

module.exports = {
    getApiData: getApiData,
    getApiDataPromise: getApiDataPromise,
    ERRORS: ERRORS
};
