var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/occurrence', router);
};

function renderSearch(req, res) {
    res.render('pages/occurrence/ocurrence', {
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


