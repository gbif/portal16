let express = require('express'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/analytics', router);
};

router.get('/faq', function(req, res, next) {
    renderPage(req, res, next);
});

function renderPage(req, res, next) {
    try {
        res.render('pages/analytics/faq', {});
    } catch (e) {
        next(e);
    }
}
