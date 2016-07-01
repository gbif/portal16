var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/occurrence', router);
};

function renderSearch(req, res) {
    res.render('pages/occurrence/ocurrence', {
        __hideSearchAction: true,
        title: 'Ocurrences',
        message: 'yada yada',
        hasDrawer: true,
        hasTools: true
    });
}

router.get('/', function (req, res) {
    renderSearch(req, res);
});

router.get('/search', function (req, res) {
    renderSearch(req, res);
});

router.get('/table', function (req, res) {
    renderSearch(req, res);
});

router.get('/gallery', function (req, res) {
    renderSearch(req, res);
});

router.get('/map', function (req, res) {
    renderSearch(req, res);
});


