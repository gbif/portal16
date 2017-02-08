"use strict";
let express = require('express'),
    router = express.Router(),
    Q = require('q'),
    helper = rootRequire('app/models/util/util'),
    format = rootRequire('app/helpers/format'),
    participantDump = rootRequire('app/controllers/country/key/participant-dump'),
    _ = require('lodash'),
    getGeoIp = rootRequire('app/helpers/utils').getGeoIp,
    async = require('async'),
    cmsConfig = rootRequire('app/models/cmsData/apiConfig'),
    countryCodeToDrupalId = _.keyBy(participantDump, 'Participant ISO 3166-2 code'),
    cmsSearchUrl = rootRequire('app/models/cmsData/apiConfig').search.url;

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/home/upcomingEvents', function (req, res) {
    let now = Math.floor(Date.now() / 1000),
        upcomingEventsUrl = cmsSearchUrl + '?filter[type]=event&filter[ge_date_ical:value][value]=' + now + '&filter[ge_date_ical:value][operator]=%22%3E%22&sort=dateStart&range=3';

    cmsSearch(upcomingEventsUrl).then(function (data) {
        res.json(data);
    }, function () {
        res.status(500);
        res.json({
            error: 'unable to process request'
        });
        //TODO log this error
    });
});

router.get('/home/localrss', function (req, res) {
        //endpoint allows for mocking ip queries eg http://localhost:7000/api/utils/localrss?mockip=89.114.136.105 is portugal
        let ip = req.query.mockip || req.clientIp || '',
        country = getGeoIp(ip), //look up ip in max mind database to get geoip info
        isoCode = _.get(country, 'country.iso_code');

    var participantId,
        participant = countryCodeToDrupalId[isoCode]; //

    if (typeof participant !== 'undefined') {
        var tasks = {};
        participantId = participant.Nid;
        tasks.participant = function (callback) {
            helper.getApiData(cmsConfig.participant.url + participantId, callback, {failHard:true});
        };
        tasks.nodeFeed = [
            'participant', function (results, callback) {
                var rssFeed = _.get(results, 'participant.data[0].rssFeed[0].url');
                if (typeof results.participant.errorType !== 'undefined' || !rssFeed) {
                    callback(null, null);
                } else {
                    helper.getApiData(rssFeed, callback, {failHard:true, retries: 1, timeoutMilliSeconds: 5000, type: 'XML'});
                }
            }
        ];

        async.auto(tasks, function(err, results){
            if (err) {
                res.status(500);
                res.send('unable to get feed');
            } else {
                var rssItem = _.get(results, 'nodeFeed.rss.channel[0].item[0]');
                if (rssItem) {
                    rssItem.pubDate = format.date(_.get(rssItem, 'pubDate[0]', ''), '');
                    rssItem.title = _.get(rssItem, 'title[0]', '');
                    rssItem.description = _.get(rssItem, 'description[0]', '');
                    rssItem.description = format.removeHtml(rssItem.description);
                    rssItem.link = _.get(rssItem, 'link[0]', '');
                    res.json(rssItem);
                } else {
                    res.status(500);
                    res.send('unable to get feed');
                }

            }
        });
    } else {
        res.status(500);
        res.send('unable to get feed');
    }
});

function cmsSearch(requestedUrl) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(requestedUrl, function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(err);
        }
    }, {retries: 2, timeoutMilliSeconds: 30000});
    return deferred.promise;
}
