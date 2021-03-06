let express = require('express'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/resource', router);
};

function renderSearch(req, res) {
        res.render('pages/resource/search/resourceSearch', {
        _meta: {
            hasTools: true,
            title: req.__('resource.resources'),
            description: req.__('resource.resourceDescription')

        }
    });
}

router.get('/', function(req, res) {
    res.redirect(302, './resource/search');
});

router.get('/search', function(req, res) {
    renderSearch(req, res);
});
