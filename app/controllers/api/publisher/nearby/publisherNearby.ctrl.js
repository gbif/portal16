"use strict";
var express = require('express'),
    Q = require('q'),
    helper = require('../../../../models/util/util'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    router = express.Router();

const querystring = require('querystring');

module.exports = function(app) {
    app.use('/api/publisher', router);
};

router.get('/nearby', function(req, res) {
	var userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	getNearByPublishers(userIp, function(publishers){
		res.json(publishers);
	});
});

function getCountryFromIp(userIp, cb) {
	//use local max mind data to find country
	cb("DK");
}

function getNearByPublishers(userIp, cb){
	getCountryFromIp(userIp, function(countryCode){
		publisherSearch({country: countryCode}).then(cb);
	});
}

function publisherSearch(query) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(apiConfig.publisher.url + '?' + querystring.stringify(query), function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(new Error(err));
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(new Error(err));
        }
    }, {retries: 3, timeoutMilliSeconds:10000});
    return deferred.promise;
}