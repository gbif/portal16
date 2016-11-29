"use strict";

var express = require('express'),
    _ = require('lodash'),
    dataset = require('./datasetViewData'),
    taxjs = require('./taxon'),
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    Taxon = require('../../../models/gbifdata/gbifdata').Taxon,
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

router.get('/dataset/:key/metrics\.:ext?', function (req, res, next) {
    //TODO return 404 if not an occurrence dataset. at this point we hae no metrics for anything but occurrence datasets
    buildModelAndRender(req, res, next, 'pages/dataset/key/usage/usage');
});

router.get('/dataset/:key/origin\.:ext?', function (req, res, next) {
    buildModelAndRender(req, res, next, 'pages/dataset/key/origin/origin');
});

router.get('/dataset/:key/taxonomy/:taxonKey?', function (req, res, next) {
    buildDatasetAndTaxonAndRender(req, res, next, 'pages/dataset/key/taxonomy/taxonomy');
});

function buildDatasetAndTaxonAndRender(req, res, next, template) {
    var datasetKey = req.params.key;
    var taxonKey = req.params.taxonKey;
    if (!utils.isGuid(datasetKey)) {
        next();
    } else {
        dataset.getDataset(datasetKey, function (err, dataset) {
            if (err) {
                next(err);
            } else if(taxonKey) {
                var options = {expand: ['name', 'constituent']};
                if (dataset.isChecklist()){
                    // nub taxa do not have verbatim data and return 404s
                    options.expand.push('verbatim');
                }
                Taxon.get(taxonKey, options).then(function (taxon) {
                    if (dataset.isChecklist()){
                        taxon.verbatim = taxjs.cleanupVerbatim(taxon.verbatim);
                    }
                    renderPage(req, res, next, template, dataset, taxon);
                })
            } else {
                renderPage(req, res, next, template, dataset);
            }
        })
    }
}

function buildModelAndRender(req, res, next, template) {
    var datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        next();
    } else {
        dataset.getDataset(datasetKey, function (err, dataset) {
            if (err) {
                next(err);
            } else {
                renderPage(req, res, next, template, dataset);
            }
        })
    }
}

function renderPage(req, res, next, template, dataset, taxon) {
    try {
        if (req.params.ext == 'debug') {
            res.json(dataset);
        } else {
            res.render(template, {
                dataset: dataset,
                taxon: taxon,
                _meta: {
                    title: dataset.record.title,
                    imageCacheUrl: imageCacheUrl
                }
            });
        }
    } catch (e) {
        next(e);
    }
}

