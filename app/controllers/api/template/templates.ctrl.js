var express = require('express'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router(),
    minute = 60, //cache goes by seconds
    hour = minute*60,
    day = hour*24;

module.exports = function (app) {
    app.use('/api/template', router);
};

router.get('/*.html', function (req, res, next) {
    res.header('Cache-Control', 'public, max-age=' + day*100);
    next();
});

router.get('/footer.html', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'shared/layout/partials/footer/footer');
});

router.get('/search.html', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'shared/layout/partials/navigation/search/search');
});

router.get('/search/eventResult.html', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/event/eventSearchResult');
});

router.get('/search/dataUseResult.html', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/dataUse/dataUseSearchResult');
});

router.get('/search/newsResult.html', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/news/newsSearchResult');
});

router.get('/search/projectResult.html', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/project/projectSearchResult');
});

router.get('/search/programmeResult.html', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/programme/programmeSearchResult');
});

router.get('/search/literatureResult.html', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/literature/literatureSearchResult');
});

router.get('/search/toolResult.html', function (req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/tool/toolSearchResult');
});
