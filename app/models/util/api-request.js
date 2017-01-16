var request = require('request'),
    async = require('async'),
    xmlParser = require('xml2js').parseString,
    log = require('../../../config/log'),
    Q = require('q');

var ERRORS = Object.freeze({
    API_TIMEOUT: 'API_TIMEOUT',
    API_ERROR: 'API_ERROR',
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
                    break;
                case 401:
                    cb(ERRORS.UNAUTHORIZED, null);
                    break;
                case 503:
                    cb(ERRORS.BACKEND_FETCH_FAILED, null);
                    break;
                default:
                    cb(ERRORS.INVALID_RESPONSE, null);
                    break;
            }
            log.error(response.statusCode + ' ' + response.statusMessage + ' while accessing ' + path);
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
