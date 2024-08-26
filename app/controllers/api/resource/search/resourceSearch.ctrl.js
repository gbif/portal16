'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    log = rootRequire('config/log'),
    resourceSearch = require('./resourceSearch'),
    resourceResultParser = require('./resourceResultParser'),
    resource = require('../../../resource/key/resourceKey'),
    contentfulLocaleMap = rootRequire('config/config').contentfulLocaleMap,
    defaultLocale = rootRequire('config/config').defaultLocale;

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/resource/search', function(req, res) {
    const origin = req.get('origin');
    log.info('origin', origin);
    const warningHeader = req.get('not-the-endpoint-you-want');
    if (warningHeader !== 'See https://techdocs.gbif.org/en/' && req.query.thisIsNotASupportedAPI !== 'true') {
        res.status(403);
        res.send('Not the endpoint you are looking for. See https://techdocs.gbif.org/en/ or get in touch with help desk if you need some help.');
        return;
    }

    resourceSearch.search(req.query, req.__)
        .then(function(result) {
            res.json(result);
        })
        .catch(function(err) {
            // console.trace(err.message);// TODO log as this shouldne happen
            // console.log(JSON.stringify(req.query, null, 2));
            res.status(500);
            res.send('Unable to parse query');
        });
});


/* for wrapping related items of an item in a manner similar to the normal search - it would benefit from a rethinking as it is neither elegant nor generic */
router.get('/resource/key/search', function(req, res) {
    let resourceKey = req.query.key,
        type = req.query.type == 'events' ? 'main.fields.events' : 'main.fields.news',
        isPreview = req.params.isPreview,
        preferedLocale = req.query.locale;

    resource.searchContentful(resourceKey, 3, isPreview)
        .then(function(results) {
            let parsedResult = transformResult(results, type, preferedLocale);
            res.json(parsedResult);
        })
        .catch(function(err) {
            // console.trace(err); // TODO log as this shouldne happen
            if (err.message == 'NO RESULTS') {
                res.status(404);
            } else {
                res.status(500);
            }
            res.send(err.message);
        });
});

router.get('/resource/alias', function(req, res) {
    let urlAlias = req.query.urlAlias,
        preferedLocale = req.query.locale;

    resourceSearch.getByAlias(urlAlias, 2, false, preferedLocale)
        .then((result) => {
            if (req.query.html == 'true') {
                res.render('pages/resource/key/help/help', result);
            } else {
                res.json(result);
            }
        })
        .catch((err) =>{
            console.trace(err);
            res.status(500);
            res.send(err.message);
        });
});

router.get('/resource/item', function(req, res) {
    resourceSearch.getItem(req.query, req.__)
        .then((resp) => {
            if (resp.count > 0) {
                res.json(resp.results[0]);
            } else {
                res.status(404);
                res.send();
            }
        })
        .catch((err) =>{
            console.trace(err);
            res.status(500);
            res.send('Failed to get the resource');
        });
});

function transformResult(results, listPath, preferedLocale) {
    // check if there is any results. if not, then the item do not exists
    if (results.total == 0) {
        throw Error('NO RESULTS');
    } else if (_.get(results, 'sys.type') !== 'Array') {
        throw Error('contentful query failed');
    }

    let contentItem = resource.getFirstContentItem(results);

    let parsedResult = {};
    parsedResult.offset = 0;
    parsedResult.endOfRecords = true;
    parsedResult.results = [];
    _.get(contentItem, listPath, []).forEach(function(e) {
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

    resourceResultParser.renameField(parsedResult.results, 'literature', 'abstract', 'summary');// rename literature.abcstract to summary for consistency with other content types
    resourceResultParser.renameField(parsedResult.results, 'event', 'country.sys.id', '_country');
    resourceResultParser.renameField(parsedResult.results, 'event', '_country', 'country');

    resourceResultParser.selectLocale(parsedResult.results,
    ['body', 'summary', 'title', 'primaryImage.description', 'primaryImage.file', 'primaryImage.title'], contentfulLocaleMap[preferedLocale], contentfulLocaleMap[defaultLocale]);
    resourceResultParser.renderMarkdown(parsedResult.results, ['body', 'summary', 'title']);
    resourceResultParser.stripHtml(parsedResult.results, ['body', 'summary', 'title']);
    resourceResultParser.concatFields(parsedResult.results, ['summary', 'body'], '_summary');
    resourceResultParser.truncate(parsedResult.results, ['title'], 150);
    resourceResultParser.truncate(parsedResult.results, ['body', 'summary', '_summary'], 200);
    resourceResultParser.addSlug(parsedResult.results, 'title', contentfulLocaleMap[preferedLocale], contentfulLocaleMap[defaultLocale]);
    resourceResultParser.addUrl(parsedResult.results);
    return parsedResult;
}

