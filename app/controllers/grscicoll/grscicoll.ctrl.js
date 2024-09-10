'use strict';

let express = require('express'),
    helper = rootRequire('app/models/util/util'),
    utils = rootRequire('app/helpers/utils'),
    _ = require('lodash'),
    resource = rootRequire('app/controllers/resource/key/resourceKey'),
    log = rootRequire('config/log'),
    config = rootRequire('config/config'),
    request = rootRequire('app/helpers/request'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

/*
GrSciColl on gbif.org is soon to be deprecated. The new site is hosted on grscicoll.org
Old URLs should simply redirect to the new site, but keep the path and parameters as they are the same for the new site.
*/
router.get('/grscicoll', redirect);
router.get('/grscicoll/*', redirect);

let supportedLanguagesOnGrSciColl = {
    // 'es': 'es',
}
function redirect(req, res, next) {
    // new grscicoll domain
    const grscicollDomain = config.grscicollDomain;
    // redirect to  new site, but keep the path and parameters as they are the same for the new site. Except the trailing grscicoll part
    let path = req.url.replace('/grscicoll', '');
    // if the path is empty, we are on the root page and should not redirect
    // if the locale is a supported language, then insert that before the path
    if (req.locale && supportedLanguagesOnGrSciColl[req.locale]) {
        path = '/' + supportedLanguagesOnGrSciColl[req.locale] + path;
    }
    let url = grscicollDomain + path;
    res.redirect(302, url);
}

// router.get('/grscicoll', render);
// router.get('/grscicoll/collection/search', render);
// router.get('/grscicoll/institution/search', render);

// router.get('/grscicoll/collection/:key/metrics', renderCollection);
// router.get('/grscicoll/collection/:key', renderCollection);
// function renderCollection(req, res, next) {
//     let collectionKey = req.params.key;
//     if (!utils.isGuid(collectionKey)) {
//         next();
//         return;
//     }
//     getData(apiConfig.collection.url + collectionKey)
//         .then(function(collection) {
//             helper.renderPage(req, res, next, {collection, _meta: {
//                 noIndex: collection.deleted,
//                 title: collection.name,
//                 description: collection.description
//             }}, 'pages/grscicoll/collection/key/seo.nunjucks');
//         })
//         .catch(function(err) {
//             if (err.statusCode === 404 ) return next();
//             next(err);
//         });
// }

// router.get('/grscicoll/institution/:key/metrics', renderInstitution);
// router.get('/grscicoll/institution/:key', renderInstitution);

// function renderInstitution(req, res, next) {
//     let institutionKey = req.params.key;
//     if (!utils.isGuid(institutionKey)) {
//         next();
//         return;
//     }
//     getData(apiConfig.institution.url + institutionKey)
//         .then(function(institution) {
//             helper.renderPage(req, res, next, {institution, _meta: {
//                 noIndex: institution.deleted,
//                 title: institution.name,
//                 description: institution.description
//             }}, 'pages/grscicoll/institution/key/seo.nunjucks');
//         })
//         .catch(function(err) {
//             if (err.statusCode === 404) return next();
//             next(err);
//         });
// }

// function render(req, res, next) {
//     let isPreview = !_.isUndefined(req.query._isPreview);
//     let cmsContent = resource.getByAlias('/grscicoll', 2, isPreview, res.locals.gb.locales.current);
//     cmsContent.then(function(content) {
//         helper.renderPage(req, res, next, content, 'pages/grscicoll/seo.nunjucks');
//     }).catch(function(err) {
//         log.info(err.message);
//         next(err);
//     });
// }

// router.get('/api/template/grscicoll/grscicoll.html', function(req, res, next) {
//     let isPreview = !_.isUndefined(req.query._isPreview);
//     let cmsContent = resource.getByAlias('/grscicoll', 2, isPreview, res.locals.gb.locales.current);
//     cmsContent.then(function(content) {
//         helper.renderPage(req, res, next, content, 'pages/grscicoll/grscicoll.template.nunjucks');
//     }).catch(function(err) {
//         log.info(err.message);
//         res.status = err.statusCode || 500;
//         res.send('failed to load template data');
//     });
// });

// async function getData(url) {
//     let response = await request({
//         url: url,
//         json: true
//     });
//     if (response.statusCode !== 200) {
//         throw response;
//     }
//     return response.body;
// }
