var express = require('express'),
    router = express.Router(),
    helper = rootRequire('app/models/util/util'),
    resource = require('../../resource/key/resourceKey');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/tools/nameparser', function (req, res) {
    res.render('pages/tools/nameParser/nameParser', {
        _meta: {
            title: req.__("meta.nameParserTitle"),
            description: req.__("meta.nameParserDescription"),
        }
    });
});

router.get('/tools/nameparser/api', function (req, res) {
    res.render('pages/tools/nameParser/nameParser', {
        _meta: {
            title: req.__("meta.nameParserTitle"),
            description: req.__("meta.nameParserDescription"),
        }
    });
});

router.get('/templates/nameparser/about.html', function (req, res, next) {

    let query = {
        content_type: 'Tool',
        'fields.keywords': 'parser'
    };
    resource.getFirst(query, 2, false, res.locals.gb.locales.current)
        .then(contentItem => {
            helper.renderPage(req, res, next, contentItem, 'pages/tools/nameparser/about/aboutArticle.nunjucks');
        })
        .catch(function(err){
            if (err.statusCode == 404) {
                next();
            } else {
                next(err);
            }
        });

});