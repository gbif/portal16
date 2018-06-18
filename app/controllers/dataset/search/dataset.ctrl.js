let express = require('express'),
    router = express.Router();

module.exports = function(app) {
    app.use('/dataset', router);
};

function searchHandler(req, res) {
    'use strict';
    let searchString = req.query.q;
    renderPage(req, res, searchString);
}

function renderPage(req, res, searchString) {
    res.render('pages/dataset/search/datasetSearch', {
        query: searchString,
        title: 'Dataset',
        _meta: {
            bodyClass: 'dataset',
            title: res.__('search.search'),
            description: 'Search for datasets in Global Biodiversity Information Facility. Free and Open Access to Biodiversity Data.'

        }
    });
}

router.get('/', function(req, res) {
    res.redirect(302, './dataset/search');
});

router.get('/search', function(req, res) {
    searchHandler(req, res);
});
