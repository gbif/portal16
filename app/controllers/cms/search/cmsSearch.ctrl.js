var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/cms', router);
};

function renderSearch(req, res) {
    res.render('pages/cms/search/cmsSearch', {
        title: 'Information',
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
    res.redirect(301, './cms/search');
});

router.get('/search', function (req, res) {
    renderSearch(req, res);
});

