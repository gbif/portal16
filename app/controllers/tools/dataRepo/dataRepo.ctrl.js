var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/data-repository', renderTemplate);
router.get('/data-repository/about', renderTemplate);
router.get('/data-repository/upload', renderTemplate);
router.get('/data-repository/upload/:key', renderTemplate);

function renderTemplate(req, res, next) {
//next();
//return;
    res.render('pages/tools/dataRepository/dataRepository', {
        _meta: {
            title: 'Data repository',
            noIndex: true
        }
    });
}