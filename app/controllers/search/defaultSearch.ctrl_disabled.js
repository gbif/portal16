//unclear if this is something we still want. it is a drupal left over in some ways

var express = require('express'),
    Q = require('q'),
    cmsSearchUrl = rootRequire('app/models/cmsData/apiConfig').search.url,
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    helper = rootRequire('app/models/util/api-request'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/search/defaultsearch\.:ext?', defaultSearch);

function defaultSearch(req, res, next) {
    getContent().then(function (news) {
        news._meta = {
            imageCacheUrl: imageCacheUrl
        };
        renderPage(req, res, next, news);
    }, function (err) {
        next(err);
    });
}

function renderPage(req, res, next, context) {
    try {
        if (req.params.ext == 'debug') {
            res.json(context);
        } else {
            res.render('pages/search/defaultSearch', context);
        }
    } catch (err) {
        next(err);
    }
}

function getContent() {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(cmsSearchUrl + '?sort=-created&page[size]=3&filter[type]=news', function (err, data) {
        if (err) {
            deferred.reject(err);
        } else if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else {
            deferred.resolve(data);
        }
    }, {retries: 2, timeoutMilliSeconds: 30000});
    return deferred.promise;
}