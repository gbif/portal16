"use strict";

var express = require('express'),
    dataset = require('./datasetViewData'),
    utils = rootRequire('app/helpers/utils'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/dataset/:key\.:ext?', function (req, res, next) {
    buildModelAndRender(req, res, next, 'pages/dataset/key/datasetKey');
});

router.get('/dataset/:key/project\.:ext?', function (req, res, next) {
    buildModelAndRender(req, res, next, 'pages/dataset/key/project/project');
});

router.get('/dataset/:key/citation\.:ext?', function (req, res, next) {
    buildModelAndRender(req, res, next, 'pages/dataset/key/citation/citation');
});

router.get('/dataset/:key/usage\.:ext?', function (req, res, next) {
    buildModelAndRender(req, res, next, 'pages/dataset/key/usage/usage');
});

router.get('/dataset/:key/origin\.:ext?', function (req, res, next) {
    buildModelAndRender(req, res, next, 'pages/dataset/key/origin/origin');
});

function buildModelAndRender(req, res, next, template) {
    var datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        next();
    } else {
        dataset.getDataset(datasetKey, function (err, viewData) {
            if (err) {
                next(err);
            } else {
                renderPage(req, res, next, template, viewData);
            }
        })
    }
}


function renderPage(req, res, next, template, dataset) {
    try {
        if (req.params.ext == 'debug') {
            res.json(dataset);
        } else {
            res.render(template, {
                dataset: dataset,
                _meta: {
                    title: dataset.record.title
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
