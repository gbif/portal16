var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/dataset', function (req, res) {
    searchHandler(req, res);
});

router.get('/dataset/search', function (req, res) {
    searchHandler(req, res);
});

function searchHandler(req, res) {
    "use strict";
    var searchString = req.query.q;
    renderPage(req, res, searchString);
}

function renderPage(req, res, searchString) {
    res.render('pages/dataset/search/datasetSearch', {
        query: searchString,
        _meta: {
            bodyClass: 'dataset',
            hideSearchAction: true,
            hideFooter: true,
            hasDrawer: true,
            hasTools: true
        }
    });
}

