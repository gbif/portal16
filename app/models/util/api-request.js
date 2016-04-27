var request = require('request'),
    async = require('async'),
    log = require('../../../config/log');

var ERRORS = Object.freeze({
    API_TIMEOUT: 'API_TIMEOUT',
    API_ERROR: 'API_ERROR',
    INVALID_RESPONSE: 'INVALID_RESPONSE'
});

function getData(cb, path, options) {
    var data;

    request(path, {timeout: options.timeoutMilliSeconds}, function(err, response, body) {
        //if timeout
        if (err) {
            if (err.code === 'ETIMEDOUT') {
                cb(ERRORS.API_TIMEOUT, null);
                log.error('timed out while connecting to api ' + path);
            } else if (err.connect === true) {
                cb(ERRORS.API_TIMEOUT, null);
                log.error('timed out getting data from api ' + path);
            } else {
                cb(ERRORS.API_ERROR, null);
                log.error('error while talking to api ' + path + ' ' + err);
            }
        }
        //if not found or not status code 200
        else if (response && response.statusCode !== 200) {
            if (response.statusCode == '404') {
                cb(ERRORS.INVALID_RESPONSE, null);
                log.error('got 404 ' + path); //TODO might be okay dependent on caller context
            } else {
                cb(ERRORS.INVALID_RESPONSE, null);
                log.error('didnt get status code 200, but ' + response.statusCode + ' from ' + path);
            }
        }

        //if no response data
        else if (!body) {
            cb(ERRORS.INVALID_RESPONSE, null);
            log.error('no response data ' + path);
        }

        //if invalid response
        else {
            try {
                data = JSON.parse(body);
            } catch (err) {
                cb(ERRORS.INVALID_RESPONSE, null);
                log.error('invalid json response ' + path);
                return;
            }
            cb(null, data);
        }
    });
}

function getApiData(path, callback, options) {
    options = options || {};
    options.timeoutMilliSeconds = options.timeoutMilliSeconds || 4000;
    options.retries = options.retries || 2;
    options.failHard = options.failHard || false;

    async.retry(
        {times: options.retries, interval: 200},
        function(cb){
            getData(cb, path, options);
        },
        function(err, result){
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
    getApiData: getApiData
};
