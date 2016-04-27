var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/occurrence', function (req, res) {
    res.render('pages/occurrence/ocurrence', {
        title: 'Ocurrences',
        message: 'yada yada',
        hasDrawer: true,
        hasTools: true
    });
});
