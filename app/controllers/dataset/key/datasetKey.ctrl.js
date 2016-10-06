"use strict";

var express = require('express'),
    dataset = require('./datasetViewData'),
    getDownloadStats = require('../../../models/gbifdata/gbifdata').getDownloadStats,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

function isGuid(stringToTest) {
    var regexGuid = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/gi;
    return regexGuid.test(stringToTest);
}

router.get('/dataset2/:key\.:ext?', function (req, res, next) {
    buildModelAndRender(req, res, next, 'pages/dataset/key/datasetKey');
});

router.get('/dataset2/:key/project\.:ext?', function (req, res, next) {
    buildModelAndRender(req, res, next, 'pages/dataset/key/project/project');
});

router.get('/dataset2/:key/credit\.:ext?', function (req, res, next) {
    buildModelAndRender(req, res, next, 'pages/dataset/key/credit/credit');
});

router.get('/dataset2/:key/usage\.:ext?', function (req, res, next) {
    //this is silly . we load all stats including those we do not need. TODO
    var datasetKey = req.params.key;
    if (!isGuid(datasetKey)) {
        next();
    } else {
        dataset.getDataset(datasetKey, function (err, viewData) {
            if (err) {
                next(err);
            } else {
                getDownloadStats(datasetKey).then(function (data) {
                    viewData._downloadStats = data;
                    renderPage(req, res, next, 'pages/dataset/key/usage/usage', viewData);
                }, function (error) {
                    next(error);
                });
            }
        })
    }
});

function buildModelAndRender(req, res, next, template) {
    var datasetKey = req.params.key;
    if (!isGuid(datasetKey)) {
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
