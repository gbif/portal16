"use strict";
let express = require('express'),
    router = express.Router(),
    Q = require('q'),
    helper = rootRequire('app/models/util/util'),
    format = rootRequire('app/helpers/format'),
    _ = require('lodash'),
    Node = rootRequire('app/models/gbifdata/gbifdata').Node,
    async = require('async'),
    minute = 60000,
    cmsSearchUrl = rootRequire('app/models/cmsData/apiConfig').search.url;

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/home/upcomingEvents', function (req, res) {
    let now = Math.floor(Date.now() / 1000),
        upcomingEventsUrl = cmsSearchUrl + '?filter[type]=event&filter[ge_date_ical:value][value]=' + now + '&filter[ge_date_ical:value][operator]=%22%3E%22&sort=dateStart&range=3';

    cmsSearch(upcomingEventsUrl).then(function (data) {
        res.setHeader('Cache-Control', 'public, max-age=' + minute*20);
        res.json(data);
    }, function () {
        res.status(500);
        res.json({
            error: 'unable to process request'
        });
        //TODO log this error
    });
});

router.get('/home/rss/:countryCode', function (req, res) {
    var countryCode = req.params.countryCode;
    var limit = req.query.limit || 4;
    if (!_.isUndefined(countryCode)) {
        Node.getByCountryCode(countryCode, {expand: ['participant']}).then(function (node) {
            var rssFeed = _.get(node, 'participant.data[0].rssFeed[0].url');
            if (!rssFeed) {
                res.status(204);
                res.send();
            } else {
                helper.getApiData(rssFeed, function(err, rssData) {
                    if (err || rssData.errorType) {
                        res.status(204);
                        res.send();
                    } else {
                        res.setHeader('Cache-Control', 'public, max-age=' + minute*20);
                        res.json(getCleanFeed(rssData, limit, countryCode));
                    }
                }, {retries: 1, timeoutMilliSeconds: 3000, type: 'XML', failHard: true});
            }
        });
    } else {
        res.status(204);
        res.send();
    }
});

function getCleanFeed(feed, limit, countryCode) {
    var rssItems = _.get(feed, 'rss.channel[0].item', []);
    rssItems = _.slice(rssItems, 0, limit);
    rssItems.forEach(function(rssItem){
        rssItem.pubDate = format.date(_.get(rssItem, 'pubDate[0]', ''), ''); //TODO localize results based on rss ? on site language?
        rssItem.title = format.removeHtml(_.get(rssItem, 'title[0]', ''));
        rssItem.description = _.get(rssItem, 'description[0]', '');
        rssItem.description = format.removeHtml(rssItem.description).slice(0, 200);
        rssItem.link = _.get(rssItem, 'link[0]', '');
    });
    return rssItems;
}

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
