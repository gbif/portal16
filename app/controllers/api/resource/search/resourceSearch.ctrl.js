"use strict";
var express = require('express'),
    router = express.Router(),
    elasticsearch = require('elasticsearch'),
    _ = require('lodash'),
    resourceSearch = require('./resourceSearch'),
    resourceResultParser = require('./resourceResultParser'),
    resource = require('../../../resource/key/resourceKey'),
    contentfulLocaleMap = rootRequire('config/config').contentfulLocaleMap,
    defaultLocale = rootRequire('config/config').defaultLocale;


var client = new elasticsearch.Client({
    host: {
        protocol: 'http',
        host: 'develastic-vh.gbif.org',
        port: 9200
    }
});

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/resource/search', function (req, res) {
    let query = resourceSearch.buildQuery(req.query),
        preferedLocale = req.query.locale;

    client.search(query).then(function (resp) {
        var parsedResult = resourceResultParser.normalize(resp, query.from, query.size);
        resourceResultParser.renameField(parsedResult.results, 'literature', 'abstract', 'summary');//rename literature.abcstract to summary for consistency with other content types
        resourceResultParser.renameField(parsedResult.results, 'event', 'description', 'summary');

        resourceResultParser.selectLocale(parsedResult.results, ['body', 'summary', 'title', 'primaryImage.description', 'primaryImage.file', 'primaryImage.title', 'grantType', 'start', 'end', 'fundsAllocated', 'matchingFunds', 'projectId', 'status', 'location', 'venue'], contentfulLocaleMap[preferedLocale], contentfulLocaleMap[defaultLocale]);
        resourceResultParser.renderMarkdown(parsedResult.results, ['body', 'summary', 'title']);
        resourceResultParser.stripHtml(parsedResult.results, ['body', 'summary', 'title']);
        resourceResultParser.concatFields(parsedResult.results, ['summary', 'body'], '_summary');
        resourceResultParser.truncate(parsedResult.results, ['title'], 150);
        resourceResultParser.truncate(parsedResult.results, ['body', 'summary', '_summary'], 200);
        resourceResultParser.addSlug(parsedResult.results, 'title', contentfulLocaleMap[preferedLocale], contentfulLocaleMap[defaultLocale]);
        resourceResultParser.transformFacets(parsedResult, req.__);

        parsedResult.filters = {};

        res.json(parsedResult);
    }, function (err) {
        console.trace(err.message);
    });
});

/*for wrapping related items of an item in a manner similar to the normal search - it would benefit from a rethinking as it is neither elegant nor generic */
router.get('/resource/key/search', function (req, res) {
    let resourceKey = req.query.key,
        type = req.query.type == 'events' ? 'main.fields.events' : 'main.fields.news',
        isPreview = req.params.isPreview,
        preferedLocale = req.query.locale;

    resource.searchContentful(resourceKey, 3, isPreview)
        .then(function (results) {
            let parsedResult = transformResult(results, type, preferedLocale);
            res.json(parsedResult);
        }, function (err) {
            console.trace(err.message);
        });
});

function transformResult(results, listPath, preferedLocale) {
    //check if there is any results. if not, then the item do not exists
    if (results.total == 0) {
        next();
        return;
    } else if(_.get(results, 'sys.type') !== 'Array') {
        next(Error('contentful query failed'));
        return;
    }

    let contentItem = resource.getFirstContentItem(results);

    let parsedResult = {};
    parsedResult.offset = 0;
    parsedResult.endOfRecords = true;
    parsedResult.results = [];
    _.get(contentItem, listPath, []).forEach(function (e) {
        let sysId = _.get(e, 'sys.id');
        if (!sysId) return false;

        let resolvedItem = _.get(contentItem, 'resolved.Entry.' + sysId);
        if (resolvedItem && resolvedItem.fields) {
            resolvedItem.fields.id = resolvedItem.sys.id;
            resolvedItem.fields.contentType = _.get(resolvedItem, 'sys.contentType.sys.id', '').toLowerCase();
            resolvedItem.fields.createdAt = _.get(resolvedItem, 'sys.createdAt');
            resolvedItem.fields._date = _.get(resolvedItem, 'sys.createdAt');
            if (resolvedItem.fields.contentType == 'event') {
                resolvedItem.fields._date = _.get(resolvedItem, 'fields.start');
            }
            parsedResult.results.push(resolvedItem.fields);
        }
    });
    parsedResult.limit = parsedResult.results.length;
    parsedResult.count = parsedResult.results.length;
    parsedResult.images = _.mapValues(contentItem.resolved.Asset, 'fields.file.url');

    resourceResultParser.renameField(parsedResult.results, 'literature', 'abstract', 'summary');//rename literature.abcstract to summary for consistency with other content types
    resourceResultParser.renameField(parsedResult.results, 'event', 'description', 'summary');

    resourceResultParser.selectLocale(parsedResult.results, ['body', 'summary', 'title', 'primaryImage.description', 'primaryImage.file', 'primaryImage.title'], contentfulLocaleMap[preferedLocale], contentfulLocaleMap[defaultLocale]);
    resourceResultParser.renderMarkdown(parsedResult.results, ['body', 'summary', 'title']);
    resourceResultParser.stripHtml(parsedResult.results, ['body', 'summary', 'title']);
    resourceResultParser.concatFields(parsedResult.results, ['summary', 'body'], '_summary');
    resourceResultParser.truncate(parsedResult.results, ['title'], 150);
    resourceResultParser.truncate(parsedResult.results, ['body', 'summary', '_summary'], 200);
    resourceResultParser.addSlug(parsedResult.results, 'title', contentfulLocaleMap[preferedLocale], contentfulLocaleMap[defaultLocale]);
    return parsedResult;
}

