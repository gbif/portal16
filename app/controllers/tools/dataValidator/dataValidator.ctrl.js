let express = require('express'),
    router = express.Router(),
helper = rootRequire('app/models/util/util'),
    resource = require('../../resource/key/resourceKey');

module.exports = function(app) {
    app.use('/', router);
};


router.get('/tools/data-validator', function(req, res) {
    res.render('pages/tools/dataValidator/dataValidator', {
        _meta: {
            title: req.__('validation.dataValidator'),
            description: req.__('validation.dataValidatorDescription'),
            noIndex: true
        }
    });
});


router.get('/tools/data-validator/about', render);
router.get('/tools/data-validator/extensions', render);
router.get('/tools/data-validator/:jobid', render);
router.get('/tools/data-validator/:jobid/document', render);
router.get('/tools/data-validator/:jobid/extensions', render);
// router.get('/tools/data-validator/:jobid/about', render);


function render(req, res, next) {
    res.render('pages/tools/dataValidator/dataValidator', {
        _meta: {
            title: req.__('validation.dataValidator'),
            description: req.__('validation.dataValidatorDescription'),
            noIndex: true
        },
        jobId: req.params.jobid
    });
}


router.get('/templates/data-validator/about.html', function(req, res, next) {
    let query = {
        'content_type': 'Tool',
        'fields.keywords': 'validator'
    };
    resource.getFirst(query, 2, false, res.locals.gb.locales.current)
        .then((contentItem) => {
            helper.renderPage(req, res, next, contentItem, 'pages/tools/dataValidator/about/aboutArticle.nunjucks');
        })
        .catch(function(err) {
            if (err.statusCode == 404) {
                next();
            } else {
                next(err);
            }
        });
});
