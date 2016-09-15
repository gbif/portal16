var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/species', router);
};

function renderSearch(req, res) {
    res.render('pages/species/search/speciesSearch', {
        title: 'Ocurrences',
        _meta: {
            hideSearchAction: false,
            hasDrawer: true,
            hasTools: true,
            hideFooter: true
        }
    });
}

router.get('/', function (req, res) {
    res.redirect(301, './species/search');
});

router.get('/search', function (req, res) {
    renderSearch(req, res);
});

router.get('/table', function (req, res) {
    renderSearch(req, res);
});

