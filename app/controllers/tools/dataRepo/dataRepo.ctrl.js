var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/tools/data-repository', function (req, res) {
    res.render('pages/tools/dataRepo/dataRepo', {
        _meta: {
            title: 'Data repository'
        }
    });
});