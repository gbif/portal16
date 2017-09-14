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

router.get('/tools/data-validator-test', function (req, res) {
    res.render('pages/tools/dataValidator/dataValidator', {
        _meta: {
            title: 'Data validator',
            noIndex: true
        }
    });
});

router.get('/tools/data-validator/:jobid', function (req, res) {
    res.render('pages/tools/dataValidator/dataValidator', {
        _meta: {
            title: 'Data validator',
            noIndex: true
        },
        jobId: req.params.jobid
    });
});
