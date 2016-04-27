var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/about/development/frontend/styleguide/', router);
};

router.get('/', function (req, res) {
    res.render('pages/about/development/frontend/styleguide/styleguide', {});
});

router.get('/typography', function (req, res) {
    res.render('pages/about/development/frontend/styleguide/typography', {});
});
