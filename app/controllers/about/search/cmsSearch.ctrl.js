var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/cms', function (req, res) {
    searchHandler(req, res);
});

router.get('/cms/table', function (req, res) {
    searchHandler(req, res);
});

function searchHandler(req, res) {
    'use strict';
    var searchString = req.query.q;
    renderPage(req, res, searchString);
}

function renderPage(req, res, searchString) {
    res.render('pages/about/search/cmsSearch', {
        query: searchString,
        _meta: {
            bodyClass: 'cms',
            hideSearchAction: true,
            hideFooter: true,
            hasDrawer: true,
            hasTools: true
        }
    });
}

