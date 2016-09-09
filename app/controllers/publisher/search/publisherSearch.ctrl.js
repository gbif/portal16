var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/publisher', router);
};

function renderSearch(req, res) {
    res.render('pages/publisher/search/publisherSearch', {
        title: 'Publishers',
        _meta: {
            hideSearchAction: false,
            hasDrawer: true,
            hasTools: true,
            hideFooter: true
        }
    });
}

router.get('/', function (req, res) {
    res.redirect(301, './publisher/search');
});

router.get('/search', function (req, res) {
    renderSearch(req, res);
});


