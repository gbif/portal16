var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/publisher', router);
};

function renderSearch(req, res) {
    res.render('pages/publisher/search/publisherSearch', {
        title: 'Publishers',
        _meta: {
            hideSearchAction: true,
            hasDrawer: true,
            hasTools: true,
            hideFooter: true,
            title: res.__('stdTerms.search')
        }
    });
}

router.get('/', function (req, res) {
    res.redirect(307, './publisher/search');
});

router.get('/search', function (req, res) {
    renderSearch(req, res);
});


