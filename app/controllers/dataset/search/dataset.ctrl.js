var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/dataset', function (req, res) {
    searchHandler(req, res);
});

router.get('/dataset/table', function (req, res) {
    searchHandler(req, res);
});

function searchHandler(req, res) {
    "use strict";
    var searchString = req.query.q;
    renderPage(req, res, searchString);
}

function renderPage(req, res, searchString) {
    res.render('pages/dataset/search/datasetSearch', {
        __hideSearchAction: true,
        query: searchString,
        hasDrawer: true,
        hasTools: true,
        meta: {
            bodyClass: 'dataset'
        }
    });
}

