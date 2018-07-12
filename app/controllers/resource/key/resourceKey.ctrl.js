'use strict';

let express = require('express'),
    _ = require('lodash'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router(),
    auth = require('../../auth/auth.service'),
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    resource = require('./resourceKey');

module.exports = function(app) {
    app.use('/', router);
};


router.get('/data-use/:id/:title?.:ext?', function(req, res, next) {
    prose(req, res, next, 'data-use', 'pages/resource/key/dataUse/dataUseStory');
});

router.get('/dataUse/:id/:title?.:ext?', function(req, res) {
    res.redirect(302, res.locals.gb.locales.urlPrefix + '/data-use/' + req.params.id + '/' + req.params.title);
});

router.get('/article/:id/:title?.:ext?', function(req, res, next) {
    prose(req, res, next, 'article', 'pages/resource/key/article/article');
});

router.get('/document/:id/:title?.:ext?', function(req, res, next) {
    prose(req, res, next, 'document', 'pages/resource/key/document/document');
});

router.get('/event/:id/:title?.:ext?', function(req, res, next) {
    prose(req, res, next, 'event', 'pages/resource/key/event/event');
});

router.get('/news/:id/:title?.:ext?', function(req, res, next) {
    prose(req, res, next, 'news', 'pages/resource/key/news/newsStory');
});

router.get('/tool/:id/:title?.:ext?', function(req, res, next) {
    prose(req, res, next, 'tool', 'pages/resource/key/tool/tool');
});

router.get('/programme/:id/:title?.:ext?', function(req, res, next) {
    prose(req, res, next, 'programme', 'pages/resource/key/programme/programme');
});

router.get('/project/:id/:title?.:ext?', function(req, res, next) {
    prose(req, res, next, 'project', 'pages/resource/key/project/project');
});

router.get('/api/resource/tool', function(req, res, next) {
    let query = req.query;
    resource.getFirst(query, 2, false, query.locale)
        .then(function(result) {
            helper.renderPage(req, res, next, result, 'pages/resource/key/tool/toolMain');
        })
        .catch(function(err) {
            res.status(500);
            res.send(err);
        });
});

router.get('/api/resource/content/:type', function(req, res, next) {
    let query = req.query;
    let type = req.params.type;
    let template;
    switch (type) {
        case 'tool':
            template = 'pages/resource/key/tool/toolMain';
            break;
        case 'network':
            template = 'pages/network/key/prose';
            break;
        default:
            template = 'pages/resource/key/article/main';
    }
    resource.getFirst(query, 2, false, query.locale)
        .then(function(result) {
            helper.renderPage(req, res, next, result, template);
        })
        .catch(function(err) {
            res.status(500);
            res.send(err);
        });
});

router.get('/country2/:id/:title?.:ext?', function(req, res, next) {
    let entry = req.params.id,
        entryTitle = req.params.title,
        preview = entryTitle === '_preview';// too see the preview of an item (using the preview api) call an item with /[id]/_preview

    resource.getParticipant(entry, 2, false, res.locals.gb.locales.current)
        .then(function(contentItem) {
            // if not a preview, then make sure the title is a part of the url by redirecting if necessary
            if (!preview) {
                if (contentItem._meta.slugTitle != entryTitle) {
                    res.redirect(302, res.locals.gb.locales.urlPrefix + '/country2/' + entry + '/' + contentItem._meta.slugTitle );
                    return;
                }
            }
            helper.renderPage(req, res, next, contentItem, 'pages/resource/key/project/project');
        })
        .catch(function(err) {
            next(err);
        });
});

function prose(req, res, next, type, template, redirectToSlug) {
    let entry = req.params.id,
        entryTitle = req.params.title,
        preview = entryTitle === '_preview';// too see the preview of an item (using the preview api) call an item with /[id]/_preview

    redirectToSlug = redirectToSlug !== false;
    // search for items with that id. search is used instead of entry get as search allow for includes of assets etc
    resource.searchContentful(entry, 2, preview, res.locals.gb.locales.current)
        .then(function(results) {
            // check if there is any results. if not, then the item do not exists
            if (results.total == 0) {
                next();
                return;
            } else if (_.get(results, 'sys.type') !== 'Array') {
                next(Error('contentful query failed'));
                return;
            }

            let contentItem = resource.getFirstContentItem(results),
                itemTitle = contentItem.main.fields.title || '',
                slugTitle = resource.getSlug(itemTitle);
            resource.mapLegacyData(contentItem);
            resource.removeUnresovable(contentItem.main.fields, contentItem.resolved);

            let img = _.get(contentItem, 'resolved.Asset[' + _.get(contentItem, 'main.fields.primaryImage.sys.id') + '].fields.file.url');
            contentItem._meta = {
                title: preview ? 'preview' : itemTitle,
                description: _.get(contentItem, 'main.fields.summary'),
                slugTitle: slugTitle
            };
            if (type === 'event') {
                contentItem._meta.calendarEventLink = apiConfig.newsroomWebcal.url + contentItem.main.sys.id;
            }
            if (img) {
                contentItem._meta.image = 'http:' + img;
            }

            // if not a preview, then make sure the title is a part of the url by redirecting if necessary
            if (!preview && redirectToSlug) {
                if (slugTitle !== '' && slugTitle != entryTitle) {
                    res.redirect(302, res.locals.gb.locales.urlPrefix + '/' + type + '/' + entry + '/' + slugTitle);
                    return;
                }
            } else {
                auth.setNoCache(res);
                contentItem._isPreview = true;
            }
            helper.renderPage(req, res, next, contentItem, template);
        })
        .catch(function(err) {
            next(err);
        });
}
