let express = require('express'),
    router = express.Router();

module.exports = function(app) {
    app.use('/publisher', router);
};

function renderSearch(req, res) {
    res.render('pages/publisher/search/publisherSearch', {
        title: 'Publishers',
        _meta: {
            title: res.__('search.search'),
            description: 'Search for publishers in Global Biodiversity Information Facility. Free and Open Access to Biodiversity Data.'

        }
    });
}

router.get('/', function(req, res) {
    res.redirect(302, './publisher/search');
});

router.get('/search', function(req, res) {
    renderSearch(req, res);
});


