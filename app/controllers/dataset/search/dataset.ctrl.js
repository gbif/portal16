var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/dataset', router);
};

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
            hasTools: true,
            title: res.__('stdTerms.search')
        }
    });
}

router.get('/', function (req, res) {
    res.redirect(302, './dataset/search');
});

router.get('/search', function (req, res) {
    searchHandler(req, res);
});