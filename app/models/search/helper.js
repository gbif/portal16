var request = require('request'),
    async = require('async');


function getApiData(path, callback) {
    var data,
        timeoutProtect = setTimeout(function() {
        // if timeout already have been triggered then do nothing
        // if (!timeoutProtect) {
        //     return
        // }
        // Clear the local timer variable, indicating the timeout has been triggered.
        timeoutProtect = null;
        // Execute the callback with an error argument.
        callback(new Error('Timeout: ' + path));
    }, 3000);
    request(path, function(err, response, body) {
        // if timeout already have been triggered then do nothing
        if (!timeoutProtect) {
            return
        }
        // Clear the local timer variable, indicating the timeout has been triggered.
        clearTimeout(timeoutProtect);
        if(err) {
            callback(new Error('Unable to get data from API : ' + err.message));
            return;
        }
        try {
            data = JSON.parse(body);
        } catch(err) {
            //TODO log that parsing went wrong
            callback(err);
            return;
        }
        callback(null, data);
    });
}

module.exports = {
    getApiData: getApiData
}