var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/dataset', function (req, res) {
    searchHandler(req, res);
});

function searchHandler(req, res) {
    "use strict";
    var searchString = req.query.q;
    renderPage(req, res, searchString);
}

function renderPage(req, res, searchString) {
    if (req.params.ext == 'json') {
        res.json(results);
    } else {
        res.render('pages/dataset/search/datasetSearch', {
            query: searchString,
            hasDrawer: true,
            hasTools: true,
            meta: {
                bodyClass: 'dataset'
            }
        });
    }
}

