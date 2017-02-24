"use strict";
let express = require('express'),
    router = express.Router(),
    Q = require('q'),
    helper = rootRequire('app/models/util/util'),
    format = rootRequire('app/helpers/format'),
    _ = require('lodash'),
    async = require('async'),
    minute = 60000,
    cmsSearchUrl = rootRequire('app/models/cmsData/apiConfig').search.url;

module.exports = function (app) {
    app.use('/', router);
};

router.get('/', function (req, res, next) {
    if (typeof req.query.q !== 'undefined') {
        res.redirect(res.locals.gb.locales.urlPrefix + '/search?q=' + req.query.q);
    } else {
        Promise.all([getNews(), getDataUseStories(), getUpcomingEvents()])
            .then(function(values){
                var highlights = {
                    newsStory: _.get(values[0], 'results[0]'),
                    dataStoryA: _.get(values[1], 'results[0]'),
                    dataStoryB: _.get(values[1], 'results[1]'),
                    event: _.get(values[2], 'results[0]')
                };
                render(req, res, next, {highlights: highlights});
            }, function(err){
                render(req, res, next);
            });
    }
});

function render(req, res, next, homeData) {
    try {
        res.render('pages/home/home', {
            home: homeData,
            _meta: {
                title: 'GBIF',
                bodyClass: 'hasTransparentMenu',
                hideSearchAction: true
            }
        });
    } catch (err) {
        next(err);
    }
}

function getNews() {
    var newsUrl = cmsSearchUrl + '?sort=-created&page[size]=1&filter[type]=news';
    return cmsSearch(newsUrl);
}

function getDataUseStories() {
    var newsUrl = cmsSearchUrl + '?sort=-created&page[size]=2&filter[type]=data_use';
    return cmsSearch(newsUrl);
}

function getUpcomingEvents() {
    let now = Math.floor(Date.now() / 1000),
        upcomingEventsUrl = cmsSearchUrl + '?filter[type]=event&filter[ge_date_ical:value][value]=' + now + '&filter[ge_date_ical:value][operator]=%22%3E%22&sort=dateStart&range=3';
    return cmsSearch(upcomingEventsUrl);
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