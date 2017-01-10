"use strict";
let express = require('express'),
    router = express.Router(),
    Q = require('q'),
    helper = rootRequire('app/models/util/util'),
    cmsSearchUrl = rootRequire('app/models/cmsData/apiConfig').search.url;

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/home/upcomingEvents', function (req, res, next) {
    let now = Math.floor(Date.now() / 1000),
        upcomingEventsUrl = cmsSearchUrl + '?filter[type]=event&filter[ge_date_ical:value][value]=' + now + '&filter[ge_date_ical:value][operator]=%22%3E%22&sort=dateStart&range=3';

    cmsSearch(upcomingEventsUrl).then(function (data) {
        res.json(data);
    }, function (err) {
        res.status(500);
        res.json({
            error: 'unable to process request'
        });
        //TODO log this error
    });
});

function cmsSearch(requestedUrl) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(requestedUrl, function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(new Error(err));
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(new Error(err));
        }
    }, {retries: 2, timeoutMilliSeconds: 30000});
    return deferred.promise;
}