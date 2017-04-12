"use strict";

let express = require('express'),
    _ = require('lodash'),
    slugify = require("slugify"),
    request = require('requestretry'),
    urljoin = require('url-join'),
    moment = require('moment'),
    helper = rootRequire('app/models/util/util'),
    querystring = require('querystring'),
    credentialsPath = rootRequire('config/config').credentials,
    credentials = require(credentialsPath).contentful.gbif,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/data-use2/:id/:title?\.:ext?', function (req, res, next) {
    prose('data-use', 'pages/about/data_use/dataUseStory', req, res, next);
});

router.get('/datause2/:id/:title?\.:ext?', function (req, res, next) {
    prose('data-use', 'pages/about/data_use/dataUseStory', req, res, next);
});

router.get('/event2/:id/:title?\.:ext?', function (req, res, next) {
    prose('event', 'pages/about/event/event2', req, res, next);
});

router.get('/news2/:id/:title?\.:ext?', function (req, res, next) {
    prose('news', 'pages/about/news/newsStory', req, res, next);
});

router.get('/tool2/:id/:title?\.:ext?', function (req, res, next) {
    prose('tool', 'pages/about/tool/tool', req, res, next);
});

function prose(type, template, req, res, next){
    let entry = req.params.id,
        entryTitle = req.params.title,
        preview = entryTitle === '_preview';// too see the preview of an item (using the preview api) call an item with /[id]/_preview

    //search for items with that id. search is used instead of entry get as search allow for includes of assets etc
    searchContentful(entry, 2, preview)
        .then(function (results) {
            //check if there is any results. if not, then the item do not exists
            if (results.total == 0) {
                next();
                return;
            } else if(_.get(results, 'sys.type') !== 'Array') {
                next(Error('contentful query failed'));
                return;
            }

            let contentItem = getFirstContentItem(results),
                itemTitle = contentItem.main.fields.title || '';
            mapLegacyData(contentItem);

            contentItem._meta = {
                title: preview ? 'preview' : itemTitle
            };

            //if not a preview, then make sure the title is a part of the url by redirecting if necessary
            if (!preview) {
                let slugTitle = getSlug(itemTitle);
                if (slugTitle != entryTitle){
                    res.redirect(302, '/'+ type +'2/' + entry + '/' + slugTitle);
                    return;
                }
            }

            helper.renderPage(req, res, next, contentItem, template);
        })
        .catch(function(err){
            next(err);
        });
}

function getSlug(str){
    return slugify(str.toLowerCase().normalize().replace(/[^\w\-]/g, '-'));
}

//router.get('/api/event/:id\.:ext?', function (req, res, next) {
//    var entryId = req.params.id;
//    var entry = entryId.substr(3);
//    getContentfulItem(entry, 2).then(function (content) {
//        res.writeHead(200, {
//            'Content-Type': 'text/calendar',
//            //'Content-disposition': 'attachment;filename=' + filename,
//            'Content-Length': icsEvent.length
//        });
//        res.end(new Buffer(icsEvent, 'binary'));
//    });
//
//});

function searchContentful(entryId, depth, isPreview) {
    let accessToken = isPreview ? credentials.preview_access_token : credentials.access_token,
        api = isPreview ? 'http://preview.contentful.com' : 'http://cdn.contentful.com',
        space = credentials.space,
        query = {
            access_token: accessToken,
            include: depth || 1,
            'sys.id': entryId
        },
        requestPath = urljoin(api, 'spaces', space, 'entries', '?' + querystring.stringify(query));

    var proseRequest = {
        url: requestPath,
        fullResponse: false,
        json: true,
        maxAttempts: 2,
        timeout: 30000,
        method: 'GET'
    };
    return request(proseRequest);
}

function getFirstContentItem(result) {
    var entry = {};
    entry.main = result.items[0];
    entry.resolved = {};
    if (_.get(result, 'includes.Entry.length', 0) > 0) {
        entry.resolved.Entry = _.keyBy(result.includes.Entry, 'sys.id');
    }
    if (_.get(result, 'includes.Asset.length', 0) > 0) {
        entry.resolved.Asset = _.keyBy(result.includes.Asset, 'sys.id');
    }
    return entry;
}

function mapLegacyData(item) {
    let creationDateFromDrupal = _.get(item, 'main.fields.meta.drupal.created');
    if (_.isInteger(creationDateFromDrupal)) {
        item.main.sys.createdAt = moment.unix(creationDateFromDrupal).format();
    }
}