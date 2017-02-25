"use strict";
let express = require('express'),
    router = express.Router(),
    Q = require('q'),
    helper = rootRequire('app/models/util/util'),
    format = rootRequire('app/helpers/format'),
    _ = require('lodash'),
    Node = rootRequire('app/models/gbifdata/gbifdata').Node,
    minute = 60000,
    Chance = require('chance'),
    chance = new Chance(),
    querystring = require('querystring'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    cmsSearchUrl = rootRequire('app/models/cmsData/apiConfig').search.url;

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/home/upcomingEvents', function (req, res) {
    let now = Math.floor(Date.now() / 1000),
        upcomingEventsUrl = cmsSearchUrl + '?filter[type]=event&filter[ge_date_ical:value][value]=' + now + '&filter[ge_date_ical:value][operator]=%22%3E%22&sort=dateStart&range=3';

    search(upcomingEventsUrl).then(function (data) {
        res.setHeader('Cache-Control', 'public, max-age=' + minute * 20);
        res.json(data);
    }, function () {
        res.status(500);
        res.json({
            error: 'unable to process request'
        });
        //TODO log this error
    });
});

router.get('/home/node/:countryCode', function (req, res) {
    var countryCode = req.params.countryCode;
    var limit = req.query.limit || 4;
    if (!_.isUndefined(countryCode)) {
        Node.getByCountryCode(countryCode, {expand: ['participant']}).then(function (node) {
            if (node.record.statusCode) {//This stinks. The wrapper i made half a year ago is insufficient. should be updated or not used for these purposes
                res.status(204);
                res.send();
            } else {
                var rssFeed = _.get(node, 'participant.data[0].rssFeed[0].url');
                if (rssFeed) {
                    helper.getApiData(rssFeed, function (err, rssData) {
                        if (err || rssData.errorType) {
                            res.status(204);
                            res.send();
                        } else {
                            res.setHeader('Cache-Control', 'public, max-age=' + minute * 20);
                            node.rss = getCleanFeed(rssData, limit, countryCode);
                            res.json(node);
                        }
                    }, {retries: 1, timeoutMilliSeconds: 3000, type: 'XML', failHard: true});
                } else {
                    res.setHeader('Cache-Control', 'public, max-age=' + minute * 20);
                    res.json(node);
                }
            }
        });
    } else {
        res.status(204);
        res.send();
    }
});

function getCleanFeed(feed, limit) {
    var rssItems = _.get(feed, 'rss.channel[0].item', []);
    rssItems = _.slice(rssItems, 0, limit);
    rssItems.forEach(function (rssItem) {
        rssItem.pubDate = format.date(_.get(rssItem, 'pubDate[0]', ''), ''); //TODO localize results based on rss ? on site language?
        rssItem.title = format.removeHtml(_.get(rssItem, 'title[0]', ''));
        rssItem.description = _.get(rssItem, 'description[0]', '');
        rssItem.description = format.removeHtml(rssItem.description).slice(0, 200);
        rssItem.link = _.get(rssItem, 'link[0]', '');
    });
    return rssItems;
}

function search(requestedUrl) {
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


router.get('/home/publishers/:countryCode', function (req, res) {
    var countryCode = req.params.countryCode;
    var limit = parseInt(req.query.limit) || 8;
    var query = {
        limit: 200,
        country: countryCode
    };
    var publisherUrl = apiConfig.publisher.url + '?' + querystring.stringify(query);
    search(publisherUrl).then(function (data) {
        delete data.endOfRecords;
        var publishers = _.filter(data.results, function (e) {
            return !!e.numPublishedDatasets;
        });
        publishers = chance.pickset(publishers, limit).map(function (e) {
            var desc = _.get(e, 'description', '');
            return {
                key: e.key,
                title: e.title,
                description: format.removeHtml(desc).slice(0, 200),
                logoUrl: e.logoUrl,
                numPublishedDatasets: e.numPublishedDatasets
            }
        });
        data.results = publishers;
        data.limit = limit;
        res.json(data)

    }, function (err) {
        res.status(_.get(err, 'errorResponse.statusCode', 500));
        res.json({
            body: _.get(err, 'errorResponse.body', err)
        });
    });
});

router.get('/home/datasets/:countryCode', function (req, res) {
    var countryCode = req.params.countryCode;
    var limit = parseInt(req.query.limit) || 8;
    var query = {
        limit: 200,
        country: countryCode
    };
    var datasetUrl = apiConfig.dataset.url + '?' + querystring.stringify(query);
    search(datasetUrl).then(function (data) {
        delete data.endOfRecords;
        data.results = chance.pickset(data.results, limit).map(function (e) {
            var desc = _.get(e, 'description', '');
            return {
                key: e.key,
                title: e.title,
                logoUrl: e.logoUrl,
                description: format.decodeHtml(format.removeHtml(desc)).slice(0, 400)
            }
        });
        res.json(data)

    }, function (err) {
        res.status(_.get(err, 'errorResponse.statusCode', 500));
        res.json({
            body: _.get(err, 'errorResponse.body', err)
        });
    });
});