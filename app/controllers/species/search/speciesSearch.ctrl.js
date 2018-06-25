let express = require('express'),
    router = express.Router();

module.exports = function(app) {
    app.use('/species', router);
};

function renderSearch(req, res) {
    res.render('pages/species/search/speciesSearch', {
        title: 'Species',
        _meta: {
            title: res.__('search.search'),
            description: 'Search for species in Global Biodiversity Information Facility. Free and Open Access to Biodiversity Data.'

        }
    });
}

router.get('/', function(req, res) {
    res.redirect(302, './species/search');
});

router.get('/search', function(req, res) {
    renderSearch(req, res);
});

router.get('/table', function(req, res) {
    renderSearch(req, res);
});

