"use strict";

var express = require('express'),
    //Dataset = require('../../../models/gbifdata/gbifdata').Dataset,
    //contributors = require('./contributors/contributors'),
    //bibliography = require('./bibliography/bibliography'),
    dataset = require('./datasetViewData'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

function isGuid(stringToTest) {
    var regexGuid = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/gi;
    return regexGuid.test(stringToTest);
}

router.get('/dataset2/:key\.:ext?', function (req, res, next) {
    var datasetKey = req.params.key;
    if (!isGuid(datasetKey)) {
        next();
    } else {
        dataset.getDataset(datasetKey, function(err, viewData) {
            if (err) {
                next(err);
            } else {
                renderPage(req, res, next, viewData);
            }
        })
    }
});


function renderPage(req, res, next, dataset) {
    try {
        if (req.params.ext == 'debug') {
            res.json(dataset);
        } else {
            res.render('pages/dataset/key/datasetKey', {
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
