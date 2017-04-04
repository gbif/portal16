"use strict";

let contentful = require('contentful'),
    express = require('express'),
    _ = require('lodash'),
    Q = require('q'),
    helper = rootRequire('app/models/util/util'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    credentialsPath = rootRequire('config/config').credentials,
    credentials = require(credentialsPath).contentful.gbif,
    format = rootRequire('app/helpers/format'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/preview/data-use/:id\.:ext?', function (req, res, next) {
    var entryId = req.params.id;
    var entry = entryId.substr(3);
    getContentfulItem(entry, 2).then(function (content) {
        content._meta = {
            title: 'Preview'
        };
        helper.renderPage(req, res, next, content, 'pages/about/data_use/tmpPreviewDataUse');
    });

});


router.get('/api/event/:id\.:ext?', function (req, res, next) {
    var entryId = req.params.id;
    var entry = entryId.substr(3);
    getContentfulItem(entry, 2).then(function (content) {
        res.writeHead(200, {
            'Content-Type': 'text/calendar',
            //'Content-disposition': 'attachment;filename=' + filename,
            'Content-Length': icsEvent.length
        });
        res.end(new Buffer(icsEvent, 'binary'));
    });

});



router.get('/preview/event/:id\.:ext?', function (req, res, next) {
    var entryId = req.params.id;
    var entry = entryId.substr(3);
    getContentfulItem(entry, 2).then(function (content) {
        content._meta = {
            title: 'Preview'
        };

        //view logic

        //is single day
        if (!content.main.fields.end || format.date(content.main.fields.start) == format.date(content.main.fields.end)) {
            content.main.fields.__singleDay = true;
        }

        helper.renderPage(req, res, next, content, 'pages/about/event/tmpPreviewEvent');
    });

});

function getContentfulItem(entryId, depth) {
    let deferred = Q.defer(),
        space = credentials.space,
        query = {
            access_token: credentials.preview_access_token,
            include: depth || 1,
            'sys.id': entryId
        };
    helper.getApiData('https://preview.contentful.com/spaces/' + space + '/entries?' + querystring.stringify(query), function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else if (data) {
            deferred.resolve(transformQueryForOne(data));
        }
        else {
            deferred.reject(err);
        }
    }, {retries: 2, timeoutMilliSeconds: 30000});
    return deferred.promise;
}

function transformQueryForOne(result) {
    var entry = {};
    entry.main = result.items[0];
    entry.resolved = {};
    if (!_.isEmpty(result.includes.Entry)) {
        entry.resolved.Entry = _.keyBy(result.includes.Entry, 'sys.id');
    }
    if (!_.isEmpty(result.includes.Asset)) {
        entry.resolved.Asset = _.keyBy(result.includes.Asset, 'sys.id');
    }
    return entry;
}