var express = require('express'),
    router = express.Router();

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

