'use strict';

let express = require('express'),
    helper = rootRequire('app/models/util/util'),
    utils = rootRequire('app/helpers/utils'),
    _ = require('lodash'),
    resource = rootRequire('app/controllers/resource/key/resourceKey'),
    log = rootRequire('config/log'),
    request = rootRequire('app/helpers/request'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

router.get('/grscicoll', render);
router.get('/grscicoll/collection/search', render);
router.get('/grscicoll/institution/search', render);
router.get('/grscicoll/person/search', render);

router.get('/grscicoll/collection/:key/metrics', renderCollection);
router.get('/grscicoll/collection/:key', renderCollection);
function renderCollection(req, res, next) {
    let collectionKey = req.params.key;
    if (!utils.isGuid(collectionKey)) {
        next();
        return;
    }
    getData(apiConfig.collection.url + collectionKey)
        .then(function(collection) {
            helper.renderPage(req, res, next, {collection, _meta: {
                title: collection.name,
                description: collection.description
            }}, 'pages/grscicoll/collection/key/seo.nunjucks');
        })
        .catch(function(err) {
            if (err.statusCode === '404') return next();
            next(err);
        });
}

router.get('/grscicoll/institution/:key/metrics', renderInstitution);
router.get('/grscicoll/institution/:key', renderInstitution);

function renderInstitution(req, res, next) {
    let institutionKey = req.params.key;
    if (!utils.isGuid(institutionKey)) {
        next();
        return;
    }
    getData(apiConfig.institution.url + institutionKey)
        .then(function(institution) {
            helper.renderPage(req, res, next, {institution, _meta: {
                title: institution.name,
                description: institution.description
            }}, 'pages/grscicoll/institution/key/seo.nunjucks');
        })
        .catch(function(err) {
            if (err.statusCode === '404') return next();
            next(err);
        });
}

router.get('/grscicoll/person/:key', renderPerson);
function renderPerson(req, res, next) {
    let personKey = req.params.key;
    if (!utils.isGuid(personKey)) {
        next();
        return;
    }
    getData(apiConfig.grscicollPerson.url + personKey)
        .then(function(person) {
            helper.renderPage(req, res, next, {person, _meta: {
                title: `${person.firstName} ${person.lastName}`,
                description: person.position
            }}, 'pages/grscicoll/person/key/seo.nunjucks');
        })
        .catch(function(err) {
            if (err.statusCode === '404') return next();
            next(err);
        });
}

function render(req, res, next) {
    let isPreview = !_.isUndefined(req.query._isPreview);
    let cmsContent = resource.getByAlias('/grscicoll', 2, isPreview, res.locals.gb.locales.current);
    cmsContent.then(function(content) {
        helper.renderPage(req, res, next, content, 'pages/grscicoll/seo.nunjucks');
    }).catch(function(err) {
        log.info(err.message);
        next(err);
    });
}

router.get('/api/template/grscicoll/grscicoll.html', function(req, res, next) {
    let isPreview = !_.isUndefined(req.query._isPreview);
    let cmsContent = resource.getByAlias('/grscicoll', 2, isPreview, res.locals.gb.locales.current);
    cmsContent.then(function(content) {
        helper.renderPage(req, res, next, content, 'pages/grscicoll/grscicoll.template.nunjucks');
    }).catch(function(err) {
        log.info(err.message);
        res.status = err.statusCode || 500;
        res.send('failed to load template data');
    });
});

async function getData(url) {
    let response = await request({
        url: url,
        json: true
    });
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}
