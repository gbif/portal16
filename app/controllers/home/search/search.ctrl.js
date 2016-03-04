var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/search', function (req, res) {
    res.render('pages/search/search', {
        __forceSearch: true
    });
});
