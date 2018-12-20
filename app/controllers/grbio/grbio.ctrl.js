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

router.get('/grbio', render);
router.get('/grbio/collection/search', render);
router.get('/grbio/institution/search', render);
router.get('/grbio/person/search', render);

router.get('/grbio/collection/:key', renderCollection);
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
            }}, 'pages/grbio/collection/key/seo.nunjucks');
        })
        .catch(function(err) {
            if (err.statusCode === '404') return next();
            next(err);
        });
}

router.get('/grbio/institution/:key', renderInstitution);
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
            }}, 'pages/grbio/institution/key/seo.nunjucks');
        })
        .catch(function(err) {
            if (err.statusCode === '404') return next();
            next(err);
        });
}

router.get('/grbio/person/:key', renderPerson);
function renderPerson(req, res, next) {
    let personKey = req.params.key;
    if (!utils.isGuid(personKey)) {
        next();
        return;
    }
    getData(apiConfig.grbioPerson.url + personKey)
        .then(function(person) {
            helper.renderPage(req, res, next, {person, _meta: {
                title: `${person.firstName} ${person.lastName}`,
                description: person.position
            }}, 'pages/grbio/person/key/seo.nunjucks');
        })
        .catch(function(err) {
            if (err.statusCode === '404') return next();
            next(err);
        });
}

function render(req, res, next) {
    let isPreview = !_.isUndefined(req.query._isPreview);
    let cmsContent = resource.getByAlias('/grbio', 2, isPreview, res.locals.gb.locales.current);
    cmsContent.then(function(content) {
        helper.renderPage(req, res, next, content, 'pages/grbio/seo.nunjucks');
    }).catch(function(err) {
        log.info(err.message);
        next(err);
    });
}

router.get('/api/template/grbio/grbio.html', function(req, res, next) {
    let isPreview = !_.isUndefined(req.query._isPreview);
    let cmsContent = resource.getByAlias('/grbio', 2, isPreview, res.locals.gb.locales.current);
    cmsContent.then(function(content) {
        helper.renderPage(req, res, next, content, 'pages/grbio/grbio.template.nunjucks');
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
