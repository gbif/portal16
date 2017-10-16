var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};


router.get('/tools/data-validator', function (req, res) {
    res.render('pages/tools/dataValidator/dataValidator', {
        _meta: {
            title: 'Data validator',
            noIndex: true
        }
    });
});





router.get('/tools/data-validator/about', render);
router.get('/tools/data-validator/extensions', render);
router.get('/tools/data-validator/:jobid', render);
router.get('/tools/data-validator/:jobid/document', render);
router.get('/tools/data-validator/:jobid/extensions', render);
//router.get('/tools/data-validator/:jobid/about', render);



function render(req, res, next) {
    res.render('pages/tools/dataValidator/dataValidator', {
        _meta: {
            title: 'Data validator',
            noIndex: true
        },
        jobId: req.params.jobid
    });
}
