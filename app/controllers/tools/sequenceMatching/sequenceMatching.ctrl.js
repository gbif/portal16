let express = require('express'),
    router = express.Router(),
    helper = rootRequire('app/models/util/util'),
    resource = require('../../resource/key/resourceKey');

module.exports = function(app) {
    app.use('/', router);
};

router.get('/tools/sequence-matching', function(req, res) {
    res.render('pages/tools/sequenceMatching/sequenceMatching', {
        _meta: {
            title: req.__('Sequence matcher'),
            description: req.__('A tool for matching fungal DNA sequences')
        }
    });
});

router.get('/tools/sequence-matching/about', function(req, res) {
    res.render('pages/tools/sequenceMatching/sequenceMatching', {
        _meta: {
            title: req.__('Sequence matcher'),
            description: req.__('A tool for matching fungal DNA sequences')
        }
    });
});

router.get('/templates/sequence-matching/about.html', function(req, res, next) {
    let query = {
        'content_type': 'Tool',
        'fields.keywords': 'sequence'
    };
    resource.getFirst(query, 2, false, res.locals.gb.locales.current)
        .then((contentItem) => {
            helper.renderPage(req, res, next, contentItem, 'pages/tools/sequenceMatching/about/aboutArticle.nunjucks');
        })
        .catch(function(err) {
            if (err.statusCode == 404) {
                next();
            } else {
                next(err);
            }
        });
});
