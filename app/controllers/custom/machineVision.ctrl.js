'use strict';

const express = require('express'),
    router = express.Router(),
    helper = rootRequire('app/models/util/util'),
    resource = rootRequire('app/controllers/resource/key/resourceKey'),
    _ = require('lodash'),
    log = rootRequire('config/log');

module.exports = (app) => {
    app.use('/', router);
};

router.get('/tools/machine-vision', function(req, res, next) {
    let isPreview = !_.isUndefined(req.query._isPreview);
    let cmsContent = resource.getFirst({
        'content_type': 'Tool',
        'fields.machineIdentifier': '/tools/machine-vision'
    }, 2, isPreview, res.locals.gb.locales.current);
    cmsContent.then(function(content) {
        helper.renderPage(req, res, next, content, 'pages/custom/machineVision/seo');
    }).catch(function(err) {
        log.info(err.message);
        next(err);
    });
});

router.get('/tools/machine-vision/statement-of-intent', function(req, res, next) {
  let isPreview = !_.isUndefined(req.query._isPreview);
  let cmsContent = resource.getByAlias('/tools/machine-vision/statement-of-intent', 2, isPreview, res.locals.gb.locales.current);
  cmsContent.then(function(content) {
      helper.renderPage(req, res, next, content, 'pages/custom/machineVision/seo');
  }).catch(function(err) {
      log.info(err.message);
      next(err);
  });
});

router.get('/api/machine-vision/machine-vision.html', function(req, res, next) {
    let isPreview = !_.isUndefined(req.query._isPreview);
    let cmsContent = resource.getFirst({
        'content_type': 'Tool',
        'fields.machineIdentifier': '/tools/machine-vision'
    }, 2, isPreview, res.locals.gb.locales.current);
    cmsContent.then(function(content) {
        helper.renderPage(req, res, next, content, 'pages/custom/machineVision/machineVision');
    }).catch(function(err) {
        log.info(err.message);
        res.status = err.statusCode || 500;
        res.send('failed to load template data');
    });
});

router.get('/api/machine-vision/statement.html', function(req, res, next) {
    let isPreview = !_.isUndefined(req.query._isPreview);
    let cmsContent = resource.getByAlias('/tools/machine-vision/statement-of-intent', 2, isPreview, res.locals.gb.locales.current);
    cmsContent.then(function(content) {
        helper.renderPage(req, res, next, content, 'pages/custom/machineVision/statement');
    }).catch(function(err) {
        log.info(err.message);
        res.status = err.statusCode || 500;
        res.send('failed to load template data');
    });
});